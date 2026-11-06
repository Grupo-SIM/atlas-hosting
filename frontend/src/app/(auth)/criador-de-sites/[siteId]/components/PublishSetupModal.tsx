"use client";

import { Check, CircleCheck, ExternalLink, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { publishSite } from "../../publish-actions";

type Mode = "own" | "sub";

export interface PublishSetup {
  atlasVmEnabled: boolean;
  /** Domínio base dos subdomínios grátis; `null` quando ainda não está configurado. */
  baseDomain: string | null;
  domains: string[];
  servers: { id: string; ip: string; name: string }[];
}

interface Props extends PublishSetup {
  defaultLabel: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  siteId: string;
}

const field =
  "h-[42px] w-full rounded-[10px] border border-[#e0ddd5] bg-white px-3.5 text-sm outline-none focus:border-[#b9b4a8]";

export const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

/** Modal central de endereço e servidor: aparece só na hora de publicar. */
export default function PublishSetupModal({
  atlasVmEnabled,
  baseDomain,
  defaultLabel,
  domains,
  onOpenChange,
  open,
  servers,
  siteId,
}: Props) {
  const router = useRouter();
  const canHost = atlasVmEnabled || servers.length > 0;
  const modes: { id: Mode; label: string }[] = [
    ...(baseDomain && canHost
      ? [{ id: "sub" as const, label: "Endereço grátis" }]
      : []),
    ...(domains.length > 0 && canHost
      ? [{ id: "own" as const, label: "Meu domínio" }]
      : []),
  ];

  const [mode, setMode] = useState<Mode>(modes[0]?.id ?? "sub");
  const [label, setLabel] = useState(defaultLabel);
  const [ownDomain, setOwnDomain] = useState(domains[0] ?? "");
  const [vpsNodeId, setVpsNodeId] = useState(servers[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedDomain, setPublishedDomain] = useState<string | null>(null);

  const target = atlasVmEnabled ? "atlas_vm" : "user_vps";
  const fullDomain =
    mode === "sub" && baseDomain
      ? `${label || "seu-site"}.${baseDomain}`
      : ownDomain;
  const canPublish =
    modes.length > 0 &&
    (mode === "sub" ? label.length > 0 : ownDomain.length > 0) &&
    (target === "atlas_vm" || vpsNodeId.length > 0);

  const submit = async () => {
    setPending(true);
    setError(null);
    const result = await publishSite({
      domain: ownDomain,
      kind: mode === "sub" ? "subdomain" : "domain",
      label,
      password: target === "user_vps" ? password : undefined,
      siteId,
      target,
      vpsNodeId,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPublishedDomain(result.domain);
    // O editor recebe o endereço novo e passa a publicar direto nele.
    router.refresh();
  };

  return (
    <Dialog
      onOpenChange={next => {
        if (!pending) onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent className="w-[calc(100vw-32px)] max-w-[460px] gap-5 overflow-hidden rounded-2xl bg-[#fcfbf8] p-7 [&>*]:min-w-0">
        {publishedDomain ? (
          <div className="flex flex-col items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#d6f34a]">
              <Check className="size-[22px]" />
            </div>
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-medium text-2xl tracking-[-0.02em]">
                Site publicado
              </DialogTitle>
              <DialogDescription>
                Ele estará acessível em alguns minutos: o endereço precisa
                propagar e o certificado HTTPS é emitido no primeiro acesso. Se
                aparecer um erro ao abrir, aguarde um pouco e atualize.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2">
              <a
                className="flex items-center gap-1.5 rounded-full bg-[#d6f34a] px-5 py-[11px] font-medium text-sm"
                href={`https://${publishedDomain}`}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-[15px]" />
                Abrir {publishedDomain}
              </a>
              <button
                className="rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                Continuar editando
              </button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-medium text-2xl tracking-[-0.02em]">
                Publicar seu site
              </DialogTitle>
              <DialogDescription>
                Escolha o endereço. Você pode trocar depois.
              </DialogDescription>
            </DialogHeader>

            {modes.length === 0 ? (
              <p className="text-[#6e6b65] text-sm">
                {canHost
                  ? "Você não tem domínios com DNS no Atlas e os subdomínios grátis não estão disponíveis."
                  : "Para publicar você precisa de uma VPS na conta ou do servidor do Atlas."}
              </p>
            ) : (
              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex min-w-0 flex-col gap-2">
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
                        onChange={e =>
                          setLabel(
                            e.target.value.toLowerCase().replace(/\s/g, "")
                          )
                        }
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
                  <p className="flex items-center gap-1.5 text-xs">
                    <CircleCheck className="size-[13px] text-[#1f7a4d]" />
                    <span className="text-[#1f7a4d]">
                      {mode === "sub"
                        ? "Você pode conectar um domínio próprio depois."
                        : "O DNS é configurado automaticamente pelo Atlas."}
                    </span>
                  </p>
                </div>

                {atlasVmEnabled ? null : (
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
                )}

                {error ? (
                  <p className="text-[13px] text-destructive">{error}</p>
                ) : null}

                <div className="flex min-w-0 flex-wrap items-center justify-between gap-2.5 pt-1">
                  <span className="min-w-0 basis-full truncate text-[#6e6b65] text-xs">
                    {fullDomain}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <button
                      className="rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm disabled:opacity-50"
                      disabled={pending}
                      onClick={() => onOpenChange(false)}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-full bg-[#d6f34a] px-5 py-[11px] font-medium text-sm disabled:opacity-50"
                      disabled={pending || !canPublish}
                      onClick={() => void submit()}
                      type="button"
                    >
                      {pending ? (
                        <Loader className="size-[15px] animate-spin" />
                      ) : null}
                      {pending ? "Publicando..." : "Publicar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
