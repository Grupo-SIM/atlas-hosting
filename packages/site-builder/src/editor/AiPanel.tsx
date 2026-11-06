"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Site } from "../model/index.js";
import { Icon } from "./icons.js";
import type {
  AiChatContext,
  AiChatEvent,
  AiConfig,
  AiMessage,
  AiStatus,
} from "./types.js";

type View =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "unavailable" }
  | { kind: "disconnected" }
  | { email?: string; kind: "connected"; plan?: string };

interface Props {
  ai: AiConfig;
  /** Contexto atual (página aberta, bloco selecionado), lido na hora de enviar. */
  getContext: () => AiChatContext;
  /** Site atual (inclui edições ainda não salvas), lido na hora de enviar. */
  getSite: () => Site;
  /** Aplica no editor um site alterado pela IA. `turn` agrupa o turno num único passo de desfazer. */
  onApply: (site: Site, change: string | undefined, turn: string) => void;
  /** Avisa o editor que a IA está (ou deixou de estar) trabalhando, para travar edição manual. */
  onBusy: (busy: boolean) => void;
  /** Guarda a conversa no navegador, por site. */
  storageKey?: string;
}

interface ChatEntry extends AiMessage {
  changes?: string[];
  failed?: boolean;
}

const SUGGESTIONS = [
  "Troque a cor principal do site para verde",
  "Como eu envio uma fonte?",
  "Como coloco anúncios no meu site?",
];

/** Markdown mínimo da IA: **negrito**, *itálico* e `código`. Vira elementos React (nunca HTML cru). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\*([^*\s][^*]*)\*/g;
  let last = 0;
  let match = re.exec(text);
  while (match) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined)
      out.push(<strong key={match.index}>{match[1]}</strong>);
    else if (match[2] !== undefined)
      out.push(<code key={match.index}>{match[2]}</code>);
    else out.push(<em key={match.index}>{match[3]}</em>);
    last = match.index + match[0].length;
    match = re.exec(text);
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const readStored = (key?: string): ChatEntry[] => {
  if (!key) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(`sbe-ai:${key}`) ?? "[]");
    return Array.isArray(raw) ? raw.slice(-40) : [];
  } catch {
    return [];
  }
};

export function AiPanel({
  ai,
  getContext,
  getSite,
  onApply,
  onBusy,
  storageKey,
}: Props) {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [running, setRunning] = useState(false);
  const [activity, setActivity] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Login em andamento.
  const [login, setLogin] = useState<{ id: string; url: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setView({ kind: "loading" });
    try {
      const res = await ai.status();
      if ("ok" in res) return setView({ kind: "error", message: res.error });
      applyStatus(res);
    } catch {
      setView({
        kind: "error",
        message: "Não foi possível verificar a conexão.",
      });
    }
  }, [ai]);

  function applyStatus(res: AiStatus) {
    if (!res.available) setView({ kind: "unavailable" });
    else if (res.connected) {
      setView({ email: res.email, kind: "connected", plan: res.plan });
    } else setView({ kind: "disconnected" });
  }

  useEffect(() => {
    void refresh();
    setMessages(readStored(storageKey));
    return () => abort.current?.abort();
  }, [refresh, storageKey]);

  useEffect(() => {
    if (!storageKey || running) return;
    try {
      localStorage.setItem(
        `sbe-ai:${storageKey}`,
        JSON.stringify(messages.slice(-40))
      );
    } catch {
      // sem armazenamento: a conversa vale só nesta sessão.
    }
  }, [messages, running, storageKey]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, activity]);

  const connect = async () => {
    setBusy(true);
    setError("");
    const res = await ai.startLogin().catch(() => null);
    setBusy(false);
    if (!res) return setError("Não foi possível iniciar a conexão.");
    if (!res.ok) return setError(res.error);
    setLogin({ id: res.loginId, url: res.url });
    window.open(res.url, "_blank", "noopener,noreferrer");
  };

  const finish = async () => {
    if (!login) return;
    setBusy(true);
    setError("");
    const res = await ai.finishLogin(login.id, code).catch(() => null);
    setBusy(false);
    if (!res) return setError("Não foi possível concluir a conexão.");
    if (!res.ok) return setError(res.error);
    setLogin(null);
    setCode("");
    setView({ email: res.email, kind: "connected", plan: res.plan });
  };

  const disconnect = async () => {
    setBusy(true);
    const res = await ai.disconnect().catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setMessages([]);
      setView({ kind: "disconnected" });
    } else setError(res?.error ?? "Não foi possível desconectar.");
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || running) return;
    const history: ChatEntry[] = [
      ...messages.filter(m => !m.failed),
      { role: "user", text },
    ];
    setMessages([...history, { changes: [], role: "assistant", text: "" }]);
    setDraft("");
    setRunning(true);
    setActivity("Pensando…");
    onBusy(true);
    const turn = `ai:${Date.now()}`;
    const controller = new AbortController();
    abort.current = controller;

    const patchLast = (fn: (m: ChatEntry) => ChatEntry) =>
      setMessages(list => [
        ...list.slice(0, -1),
        fn(list[list.length - 1] as ChatEntry),
      ]);

    const onEvent = (event: AiChatEvent) => {
      if (event.type === "delta") {
        setActivity("");
        patchLast(m => ({ ...m, text: m.text + event.text }));
      } else if (event.type === "tool") {
        setActivity(event.reading ? "Lendo o site…" : "Editando o site…");
      } else if (event.type === "site") {
        onApply(event.site, event.change, turn);
        if (event.change) {
          patchLast(m => ({
            ...m,
            changes: [...(m.changes ?? []), event.change as string],
          }));
        }
      } else if (event.type === "error") {
        patchLast(m => ({ ...m, failed: true, text: m.text || event.message }));
      }
    };

    try {
      await ai.chat(
        {
          context: getContext(),
          messages: history.map(({ role, text: t }) => ({ role, text: t })),
          site: getSite(),
        },
        onEvent,
        controller.signal
      );
    } catch {
      if (!controller.signal.aborted) {
        patchLast(m => ({
          ...m,
          failed: true,
          text:
            m.text || "Não consegui falar com a Atlas IA agora. Tente de novo.",
        }));
      }
    } finally {
      setRunning(false);
      setActivity("");
      onBusy(false);
      abort.current = null;
      patchLast(m =>
        m.text || m.changes?.length
          ? m
          : {
              ...m,
              text: controller.signal.aborted ? "Parei por aqui." : "Pronto.",
            }
      );
    }
  };

  if (view.kind === "loading") {
    return <div className="sbe-ai-note">Verificando a conexão…</div>;
  }
  if (view.kind === "error") {
    return (
      <div className="sbe-empty">
        <p>{view.message}</p>
        <button
          className="sbe-btn round"
          onClick={() => void refresh()}
          type="button"
        >
          Tentar de novo
        </button>
      </div>
    );
  }
  if (view.kind === "unavailable") {
    return (
      <div className="sbe-empty">
        <div className="ico">
          <Icon name="sparkles" size={20} />
        </div>
        <h4>Atlas IA indisponível</h4>
        <p>
          O servidor da IA ainda não foi configurado. Por enquanto, edite pelo
          painel lateral.
        </p>
      </div>
    );
  }

  if (view.kind === "disconnected") {
    return (
      <div className="sbe-empty">
        <div className="ico">
          <Icon name="sparkles" size={20} />
        </div>
        <h4>Edite com a Atlas IA</h4>
        <p>
          Conecte a sua assinatura do Claude e peça mudanças no site
          conversando. A IA edita a página por você.
        </p>
        {login ? (
          <div className="sbe-ai-login">
            <p className="sbe-hint">
              1. Autorize na janela do Claude que abriu.
              <br />
              2. Copie o código que ele mostrar e cole aqui.
            </p>
            <a
              className="sbe-link"
              href={login.url}
              rel="noreferrer"
              target="_blank"
            >
              Abrir o link de novo
            </a>
            <input
              autoComplete="off"
              onChange={e => setCode(e.target.value)}
              placeholder="Código do Claude"
              type="text"
              value={code}
            />
            <button
              className="sbe-btn round dark"
              disabled={busy || !code.trim()}
              onClick={() => void finish()}
              type="button"
            >
              {busy ? "Conectando…" : "Concluir conexão"}
            </button>
          </div>
        ) : (
          <button
            className="sbe-btn round dark"
            disabled={busy}
            onClick={() => void connect()}
            type="button"
          >
            {busy ? "Abrindo…" : "Conectar minha assinatura Claude"}
          </button>
        )}
        {error ? <p className="sbe-hint sbe-ai-err">{error}</p> : null}
      </div>
    );
  }

  return (
    <>
      <div className="sbe-ai-head">
        <span title={view.email}>
          <Icon name="circle-check" size={13} />
          {view.email ?? "Conectado"}
          {view.plan ? ` · ${view.plan}` : ""}
        </span>
        <button
          className="sbe-link"
          disabled={busy || running}
          onClick={() => void disconnect()}
          type="button"
        >
          Desconectar
        </button>
      </div>

      <div className="sbe-scroll sbe-ai-list">
        {messages.length === 0 ? (
          <div className="sbe-ai-hello">
            <p>Peça uma mudança no site ou pergunte como usar o editor.</p>
            {SUGGESTIONS.map(s => (
              <button
                className="sbe-btn"
                key={s}
                onClick={() => void send(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
        {messages.map((m, i) => (
          <div
            className={`sbe-ai-msg ${m.role}${m.failed ? "failed" : ""}`}
            // biome-ignore lint/suspicious/noArrayIndexKey: a conversa só cresce
            key={i}
          >
            {m.text ? (
              <p>{m.role === "assistant" ? inline(m.text) : m.text}</p>
            ) : null}
            {m.changes?.length ? (
              <ul>
                {m.changes.map((c, n) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: lista só cresce
                  <li key={n}>{c}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
        {running && activity ? (
          <div className="sbe-ai-note">{activity}</div>
        ) : null}
        <div ref={bottom} />
      </div>

      {error ? <p className="sbe-hint sbe-ai-err">{error}</p> : null}
      <form
        className="sbe-ai-input"
        onSubmit={e => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <textarea
          disabled={running}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(draft);
            }
          }}
          placeholder={
            running ? "A IA está editando…" : "Pergunte ou peça uma mudança…"
          }
          rows={2}
          value={draft}
        />
        {running ? (
          <button
            className="stop"
            onClick={() => abort.current?.abort()}
            title="Parar"
            type="button"
          >
            Parar
          </button>
        ) : (
          <button disabled={!draft.trim()} title="Enviar" type="submit">
            <Icon name="arrow-up" size={14} />
          </button>
        )}
      </form>
    </>
  );
}
