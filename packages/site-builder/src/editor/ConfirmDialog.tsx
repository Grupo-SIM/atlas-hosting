"use client";

import { useEffect, useRef, useState } from "react";

/** Página/post que está sendo excluído e ainda é usado como link: o usuário escolhe o que fazer com eles. */
export interface RelinkRequest {
  /** `href` vazio = deixar sem link. */
  onConfirm: (href: string) => void;
  /** Para onde os links podem ser redirecionados. */
  pages: { href: string; label: string }[];
  /** Onde o link aparece (texto legível). */
  references: string[];
}

export interface ConfirmRequest {
  confirmLabel?: string;
  message: string;
  onConfirm: () => void;
  /** Se existir, o botão de confirmar chama `relink.onConfirm` com o destino escolhido. */
  relink?: RelinkRequest;
  title: string;
}

const NONE = "";
const CUSTOM = "__custom";

/** Confirmação em modal no centro da tela (nunca `window.confirm`). */
export function ConfirmDialog({
  onClose,
  request,
}: {
  onClose: () => void;
  request: ConfirmRequest;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [choice, setChoice] = useState(NONE);
  const [custom, setCustom] = useState("");
  const relink = request.relink;
  const customOk = /^(\/|https?:\/\/)\S+$/.test(custom.trim());
  const blocked = relink && choice === CUSTOM && !customOk;
  useEffect(() => confirmRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: clicar no fundo fecha o modal
    <div
      className="sbe-modal"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div aria-modal="true" className="sbe-dialog sbe-confirm" role="dialog">
        <header>
          <div>
            <h3>{request.title}</h3>
            <p>{request.message}</p>
          </div>
        </header>
        {relink ? (
          <div className="sbe-relink">
            <ul>
              {relink.references.slice(0, 6).map(r => (
                <li key={r}>{r}</li>
              ))}
              {relink.references.length > 6 ? (
                <li>e mais {relink.references.length - 6}…</li>
              ) : null}
            </ul>
            <label className="sbe-field">
              <span>O que colocar no lugar desses links?</span>
              <select onChange={e => setChoice(e.target.value)} value={choice}>
                <option value={NONE}>Deixar sem link</option>
                {relink.pages.map(p => (
                  <option key={p.href} value={p.href}>
                    Levar para: {p.label}
                  </option>
                ))}
                <option value={CUSTOM}>Outro endereço…</option>
              </select>
            </label>
            {choice === CUSTOM ? (
              <label className="sbe-field">
                <span>Endereço</span>
                <input
                  onChange={e => setCustom(e.target.value)}
                  placeholder="/pagina/ ou https://…"
                  type="text"
                  value={custom}
                />
                {custom && !customOk ? (
                  <small>Comece com / ou https://</small>
                ) : null}
              </label>
            ) : null}
            <p className="sbe-hint">
              Sem link: campos de link ficam vazios e os itens do menu que
              apontavam para cá são removidos.
            </p>
          </div>
        ) : null}
        <footer>
          <button className="sbe-btn" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="sbe-btn danger"
            disabled={Boolean(blocked)}
            onClick={() => {
              onClose();
              if (relink) {
                relink.onConfirm(choice === CUSTOM ? custom.trim() : choice);
              } else {
                request.onConfirm();
              }
            }}
            ref={confirmRef}
            type="button"
          >
            {request.confirmLabel ?? "Confirmar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
