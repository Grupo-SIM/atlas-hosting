"use client";

import {
  ArrowRight,
  Check,
  Circle,
  CircleCheck,
  ExternalLink,
  LayoutTemplate,
  Loader,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createSite } from "../../../actions";
import { Frame } from "../../../components/Frame";
import { publishSite } from "../../../publish-actions";

type Mode = "later" | "own" | "sub";
type Phase = "deploying" | "form";

interface Props {
  atlasVmEnabled: boolean;
  /** Domínio base dos subdomínios grátis; `null` quando ainda não está configurado. */
  baseDomain: string | null;
  defaultName: string;
  domains: string[];
  /** Prévia do template já renderizada no servidor. */
  preview: ReactNode;
  previewBackground: string;
  servers: { id: string; ip: string; name: string }[];
  templateId: string;
  templateName: string;
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

const field =
  "h-[42px] w-full rounded-[10px] border border-[#e0ddd5] bg-white px-3.5 text-sm outline-none focus:border-[#b9b4a8]";

export default function ConfigureForm({
  atlasVmEnabled,
  baseDomain,
  defaultName,
  domains,
  preview,
  previewBackground,
  servers,
  templateId,
  templateName,
}: Props) {
  const canHost = atlasVmEnabled || servers.length > 0;
  const modes: { id: Mode; label: string }[] = [
    ...(baseDomain && canHost
      ? [{ id: "sub" as const, label: "Endereço grátis" }]
      : []),
    ...(domains.length > 0 && canHost
      ? [{ id: "own" as const, label: "Meu domínio" }]
      : []),
    { id: "later", label: "Definir depois" },
  ];

  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState(defaultName);
  const [mode, setMode] = useState<Mode>(modes[0]?.id ?? "later");
  const [label, setLabel] = useState(slug(defaultName));
  const [labelEdited, setLabelEdited] = useState(false);
  const [ownDomain, setOwnDomain] = useState(domains[0] ?? "");
  const [vpsNodeId, setVpsNodeId] = useState(servers[0]?.id ?? "");
  const [password, setPassword] = useState("");

  const [progress, setProgress] = useState(0);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [publishedDomain, setPublishedDomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const fullDomain =
    mode === "sub" && baseDomain
      ? `${label || "seu-site"}.${baseDomain}`
      : mode === "own"
        ? ownDomain
        : "";
  const target = atlasVmEnabled ? "atlas_vm" : "user_vps";
  const canCreate =
    name.trim().length > 0 &&
    (mode === "later" ||
      (fullDomain.length > 0 && (mode !== "sub" || label.length > 0)));

  const steps =
    mode === "later"
      ? ["Criando o site", "Preparando o editor"]
      : [
          "Criando o site",
          `Instalando o template ${templateName}`,
          "Enviando para o servidor",
          `Configurando ${fullDomain}`,
        ];

  const create = async () => {
    setPhase("deploying");
    setProgress(0);
    setError(null);
    setFinished(false);

    const created = await createSite({ name, templateId });
    if (!created.ok) {
      setError(created.error);
      setFinished(true);
      return;
    }
    setSiteId(created.siteId);
    setProgress(1);

    if (mode === "later") {
      setProgress(steps.length);
      setFinished(true);
      return;
    }

    // A publicação é uma chamada só; os passos avançam enquanto ela roda.
    timer.current = setInterval(
      () => setProgress(p => Math.min(p + 1, steps.length - 1)),
      2500
    );
    const published = await publishSite({
      domain: ownDomain,
      kind: mode === "sub" ? "subdomain" : "domain",
      label,
      password: target === "user_vps" ? password : undefined,
      siteId: created.siteId,
      target,
      vpsNodeId,
    });
    clearInterval(timer.current);
    if (published.ok) {
      setPublishedDomain(published.domain);
      setProgress(steps.length);
    } else {
      setError(published.error);
    }
    setFinished(true);
  };

  if (phase === "deploying") {
    const done = finished && !error;
    const siteCreated = siteId !== null;
    return (
      <Frame
        crumbs={[
          { href: "/criador-de-sites", label: "Sites" },
          { label: done ? "Publicação" : "Criando site" },
        ]}
        icon={<LayoutTemplate className="size-[15px]" />}
      >
        <div className="flex flex-1 items-center justify-center overflow-auto p-10">
          <div className="flex w-full max-w-[520px] flex-col gap-7">
            <div className="flex flex-col items-start gap-2">
              {done ? (
                <div className="flex size-11 items-center justify-center rounded-full bg-[#d6f34a]">
                  <Check className="size-[22px]" />
                </div>
              ) : null}
              <h1 className="font-medium text-[28px] tracking-[-0.02em]">
                {done
                  ? "Seu site está pronto"
                  : error
                    ? siteCreated
                      ? "Site criado, mas não foi publicado"
                      : "Não foi possível criar o site"
                    : "Criando seu site…"}
              </h1>
              <p className="text-[#6e6b65] text-sm">
                {error
                  ? error
                  : done
                    ? "Agora é só personalizar. Clique em qualquer parte do site para editar."
                    : "Isso leva menos de um minuto. Pode deixar esta aba aberta."}
              </p>
            </div>

            <div className="h-1.5 overflow-hidden rounded-md bg-[#ece9e2]">
              <div
                className="h-full rounded-md bg-[#1d1c1a] transition-[width] duration-[600ms]"
                style={{ width: `${(progress / steps.length) * 100}%` }}
              />
            </div>

            <ul className="flex flex-col rounded-[14px] border border-[#e5e2db] bg-white">
              {steps.map((step, i) => {
                const isDone = i < progress;
                const active = i === progress && !finished;
                return (
                  <li
                    className={`flex items-center gap-3 px-4 py-3.5 ${i ? "border-[#f0eee9] border-t" : ""} ${isDone || active ? "text-[#1d1c1a]" : "text-[#9a968e]"}`}
                    key={step}
                  >
                    <span
                      className={`flex size-[22px] shrink-0 items-center justify-center rounded-full ${
                        isDone
                          ? "bg-[#d6f34a] text-[#1d1c1a]"
                          : active
                            ? "bg-[#1d1c1a] text-white"
                            : "bg-[#f1efea] text-[#c3bfb6]"
                      }`}
                    >
                      {isDone ? (
                        <Check className="size-3" />
                      ) : active ? (
                        <Loader className="size-3 animate-spin" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                    </span>
                    <span className="flex-1 text-sm">{step}</span>
                  </li>
                );
              })}
            </ul>

            {finished && siteCreated ? (
              <div className="flex flex-wrap gap-2">
                <Link
                  className="flex items-center gap-2 rounded-full bg-[#d6f34a] px-5 py-[11px] font-medium text-sm"
                  href={`/criador-de-sites/${siteId}`}
                >
                  <Sparkles className="size-[15px]" />
                  Personalizar no editor
                </Link>
                {publishedDomain ? (
                  <a
                    className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm"
                    href={`https://${publishedDomain}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="size-[15px]" />
                    Abrir {publishedDomain}
                  </a>
                ) : null}
                {error ? (
                  <Link
                    className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm"
                    href={`/criador-de-sites/${siteId}/publicar`}
                  >
                    Tentar publicar de novo
                  </Link>
                ) : null}
              </div>
            ) : null}
            {finished && !siteCreated ? (
              <div>
                <button
                  className="rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm"
                  onClick={() => setPhase("form")}
                  type="button"
                >
                  Voltar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </Frame>
    );
  }

  return (
    <Frame
      closeHref="/criador-de-sites"
      crumbs={[
        { href: "/criador-de-sites", label: "Sites" },
        { href: "/criador-de-sites/novo", label: "Novo site" },
        { label: templateName },
      ]}
      icon={<LayoutTemplate className="size-[15px]" />}
      step={2}
    >
      <div className="grid flex-1 overflow-auto lg:grid-cols-[minmax(340px,440px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-[26px] border-[#ece9e2] border-r p-9">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-medium text-2xl tracking-[-0.02em]">
              Configure seu site
            </h1>
            <p className="text-[#6e6b65] text-sm">
              Duas informações e ele está pronto.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-medium text-[13px]">Nome do site</span>
            <input
              className={field}
              maxLength={120}
              onChange={e => {
                setName(e.target.value);
                if (!labelEdited) setLabel(slug(e.target.value));
              }}
              value={name}
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-[13px]">Endereço</span>
            <div className="flex gap-1 rounded-[10px] bg-[#f1efea] p-[3px]">
              {modes.map(m => (
                <button
                  className={`flex-1 rounded-lg px-2.5 py-[7px] text-[13px] ${
                    mode === m.id
                      ? "bg-white font-medium text-[#1d1c1a] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                      : "text-[#6e6b65]"
                  }`}
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  type="button"
                >
                  {m.label}
                </button>
              ))}
            </div>

            {mode === "sub" && baseDomain ? (
              <div className="flex h-[42px] items-center overflow-hidden rounded-[10px] border border-[#e0ddd5] bg-white">
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm outline-none"
                  onChange={e => {
                    setLabelEdited(true);
                    setLabel(e.target.value.toLowerCase().replace(/\s/g, ""));
                  }}
                  value={label}
                />
                <span className="flex h-full items-center border-[#ece9e2] border-l bg-[#f7f6f2] px-3.5 text-[#6e6b65] text-sm">
                  .{baseDomain}
                </span>
              </div>
            ) : null}
            {mode === "own" ? (
              <select
                className={field}
                onChange={e => setOwnDomain(e.target.value)}
                value={ownDomain}
              >
                {domains.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ) : null}
            <p className="flex items-center gap-1.5 text-[#6e6b65] text-xs">
              {mode === "later" ? (
                canHost ? (
                  "Você escolhe o endereço na hora de publicar."
                ) : (
                  "Para publicar você precisa de uma VPS na conta ou do servidor do Atlas."
                )
              ) : (
                <>
                  <CircleCheck className="size-[13px] text-[#1f7a4d]" />
                  <span className="text-[#1f7a4d]">
                    {mode === "sub"
                      ? "Você pode conectar um domínio próprio depois."
                      : "O DNS é configurado automaticamente pelo Atlas."}
                  </span>
                </>
              )}
            </p>
          </div>

          {mode !== "later" && !atlasVmEnabled ? (
            <div className="flex flex-col gap-2">
              <span className="font-medium text-[13px]">Servidor</span>
              <select
                className={field}
                onChange={e => setVpsNodeId(e.target.value)}
                value={vpsNodeId}
              >
                {servers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.ip})
                  </option>
                ))}
              </select>
              <input
                autoComplete="off"
                className={field}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha root (opcional em VPS criada pelo Atlas)"
                type="password"
                value={password}
              />
              <p className="text-[#6e6b65] text-xs">
                Usada só para enviar os arquivos agora. Não é gravada.
              </p>
            </div>
          ) : null}

          <div className="flex-1" />
          <div className="flex justify-between gap-2.5">
            <Link
              className="rounded-full border border-[#e0ddd5] bg-white px-[18px] py-[11px] text-sm"
              href="/criador-de-sites/novo"
            >
              Voltar
            </Link>
            <button
              className="flex items-center gap-2 rounded-full bg-[#d6f34a] px-5 py-[11px] font-medium text-sm disabled:opacity-50"
              disabled={!canCreate}
              onClick={() => void create()}
              type="button"
            >
              Criar site
              <ArrowRight className="size-[15px]" />
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 bg-[#f3f1ec] p-7">
          <div className="flex max-w-full items-center gap-2 self-center rounded-full border border-[#e5e2db] bg-white px-3.5 py-[7px] text-[#55524c] text-[13px]">
            <Lock className="size-3 text-[#1f7a4d]" />
            <span className="truncate">
              {fullDomain || "endereço a definir"}
            </span>
          </div>
          <div
            className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-[#e0ddd5] shadow-[0_10px_30px_rgba(30,28,24,0.08)]"
            style={{ background: previewBackground }}
          >
            <div className="absolute inset-0 overflow-hidden">{preview}</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}
