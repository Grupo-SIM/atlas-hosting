"use client";

import {
  Check,
  CircleCheck,
  CreditCard,
  ExternalLink,
  Loader,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPublishJobStatus,
  startPublishCheckout,
} from "../../publish-checkout-actions";
import DomainSearchPicker, {
  brl,
  type DomainOffer,
} from "./DomainSearchPicker";
import { atlasHostingPrice } from "./publish-pricing";

type Mode = "buy" | "own" | "sub";

export interface PublishSetup {
  /** Preço mensal da hospedagem na VM do Atlas; `null` = opção desligada. */
  atlasVmMonthlyBrl: number | null;
  /** Domínio base dos subdomínios grátis; `null` quando ainda não está configurado. */
  baseDomain: string | null;
  /** Admins e a conta autorizada não pagam hospedagem na VM do Atlas. */
  complimentaryAtlasHosting: boolean;
  domains: string[];
  /** Só VPS contratadas no Atlas e com assinatura em dia. */
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

/**
 * Modal central de endereço e servidor. Também vende o domínio e a hospedagem
 * na VM do Atlas: quando há algo a pagar, o site sobe só depois do pagamento
 * confirmado e esta tela acompanha a entrega.
 */
export default function PublishSetupModal({
  atlasVmMonthlyBrl,
  baseDomain,
  complimentaryAtlasHosting,
  defaultLabel,
  domains,
  onOpenChange,
  open,
  servers,
  siteId,
}: Props) {
  const router = useRouter();
  const atlasVmEnabled = atlasVmMonthlyBrl !== null;
  const canHost = atlasVmEnabled || servers.length > 0;

  const modes: { id: Mode; label: string }[] = [
    ...(baseDomain ? [{ id: "sub" as const, label: "Endereço grátis" }] : []),
    ...(domains.length > 0
      ? [{ id: "own" as const, label: "Meu domínio" }]
      : []),
    { id: "buy" as const, label: "Comprar domínio" },
  ];

  const [mode, setMode] = useState<Mode>(modes[0]?.id ?? "buy");
  const [label, setLabel] = useState(defaultLabel);
  const [ownDomain, setOwnDomain] = useState(domains[0] ?? "");
  const [offer, setOffer] = useState<DomainOffer | null>(null);
  const [target, setTarget] = useState<"atlas_vm" | "user_vps">(
    servers.length > 0 ? "user_vps" : "atlas_vm"
  );
  const [vpsNodeId, setVpsNodeId] = useState(servers[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedDomain, setPublishedDomain] = useState<string | null>(null);
  const [waitingPayment, setWaitingPayment] = useState(false);

  const fullDomain =
    mode === "sub" && baseDomain
      ? `${label || "seu-site"}.${baseDomain}`
      : mode === "buy"
        ? (offer?.domain ?? "")
        : ownDomain;

  // Hospedagem na VM do Atlas é mensal; contas isentas não pagam o primeiro mês.
  const hostingPrice = atlasHostingPrice({
    atlasVmMonthlyBrl,
    complimentaryAtlasHosting,
    hostingPaid: false,
    target,
  });
  const domainPrice = mode === "buy" ? (offer?.priceBrl ?? null) : null;
  const total = (hostingPrice ?? 0) + (domainPrice ?? 0);

  const canPublish =
    canHost &&
    (mode === "sub"
      ? label.length > 0
      : mode === "buy"
        ? Boolean(offer)
        : ownDomain.length > 0) &&
    (target === "atlas_vm" ? atlasVmEnabled : vpsNodeId.length > 0);

  // Volta do checkout: acompanha a entrega até o site subir.
  useEffect(() => {
    if (!waitingPayment) return;
    const timer = setInterval(async () => {
      const status = await getPublishJobStatus(siteId);
      if (!status.ok) return;
      if (status.publishedDomain) {
        setWaitingPayment(false);
        setPublishedDomain(status.publishedDomain);
        router.refresh();
        return;
      }
      if (status.job?.status === "failed") {
        setWaitingPayment(false);
        setError(
          status.job.error ??
            "O pagamento foi confirmado, mas a publicação falhou. Fale com o suporte."
        );
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [router, siteId, waitingPayment]);

  const submit = async () => {
    setPending(true);
    setError(null);
    const result = await startPublishCheckout({
      domain: mode === "buy" ? offer?.domain : ownDomain,
      kind: mode === "sub" ? "subdomain" : mode === "buy" ? "buy" : "domain",
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
    if (result.published) {
      setPublishedDomain(result.domain);
      router.refresh();
      return;
    }
    if (result.checkoutUrl) {
      // O site sobe sozinho quando o pagamento é confirmado.
      setWaitingPayment(true);
      window.open(result.checkoutUrl, "_blank", "noopener");
    }
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
        ) : waitingPayment ? (
          <div className="flex flex-col items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#f1efea]">
              <Loader className="size-[22px] animate-spin" />
            </div>
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-medium text-2xl tracking-[-0.02em]">
                Aguardando o pagamento
              </DialogTitle>
              <DialogDescription>
                Abrimos o checkout em outra aba. Assim que o pagamento for
                confirmado, publicamos o site automaticamente — esta tela avisa
                quando ele estiver no ar. Pode fechar e voltar depois.
              </DialogDescription>
            </DialogHeader>
            {error ? (
              <p className="text-[13px] text-destructive">{error}</p>
            ) : null}
            <button
              className="rounded-full border border-[#e0ddd5] bg-white px-4 py-[11px] text-sm"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="font-medium text-2xl tracking-[-0.02em]">
                Publicar seu site
              </DialogTitle>
              <DialogDescription>
                Escolha o endereço e onde ele vai ficar hospedado.
              </DialogDescription>
            </DialogHeader>

            {canHost ? (
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
                  {mode === "buy" ? (
                    <DomainSearchPicker
                      fieldClassName={field}
                      onSelect={setOffer}
                      selected={offer}
                    />
                  ) : null}
                  {mode === "buy" ? null : (
                    <p className="flex items-center gap-1.5 text-xs">
                      <CircleCheck className="size-[13px] text-[#1f7a4d]" />
                      <span className="text-[#1f7a4d]">
                        {mode === "sub"
                          ? "Você pode conectar um domínio próprio depois."
                          : "O DNS é configurado automaticamente pelo Atlas."}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-medium text-[13px]">Servidor</span>
                  <select
                    className={field}
                    onChange={e =>
                      setTarget(e.target.value as "atlas_vm" | "user_vps")
                    }
                    value={target}
                  >
                    {servers.length > 0 ? (
                      <option value="user_vps">
                        Minha VPS do Atlas (sem custo extra)
                      </option>
                    ) : null}
                    {atlasVmEnabled ? (
                      <option value="atlas_vm">
                        Hospedagem do Atlas —{" "}
                        {complimentaryAtlasHosting
                          ? "gratuita"
                          : `${brl(atlasVmMonthlyBrl)}/mês`}
                      </option>
                    ) : null}
                  </select>

                  {target === "user_vps" ? (
                    <>
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
                    </>
                  ) : (
                    <p className="text-[#6e6b65] text-xs">
                      {complimentaryAtlasHosting
                        ? "Nós cuidamos do servidor, do HTTPS e das atualizações sem cobrança para sua conta."
                        : "Nós cuidamos do servidor, do HTTPS e das atualizações. Cobrança mensal, cancela quando quiser."}
                    </p>
                  )}

                  {servers.length === 0 ? (
                    <p className="text-[#6e6b65] text-xs">
                      Você não tem VPS contratada no Atlas. Pode publicar na
                      hospedagem do Atlas acima ou{" "}
                      <a className="underline" href="/vps">
                        contratar uma VPS
                      </a>
                      .
                    </p>
                  ) : null}
                </div>

                {total > 0 ? (
                  <div className="flex flex-col gap-1.5 rounded-[10px] border border-[#e0ddd5] bg-white p-3.5 text-sm">
                    {domainPrice !== null && offer ? (
                      <div className="flex justify-between gap-3">
                        <span className="min-w-0 truncate text-[#6e6b65]">
                          Registro de {offer.domain} (1 ano)
                        </span>
                        <span>{brl(domainPrice)}</span>
                      </div>
                    ) : null}
                    {hostingPrice !== null ? (
                      <div className="flex justify-between gap-3">
                        <span className="text-[#6e6b65]">
                          Hospedagem (1º mês)
                        </span>
                        <span>{brl(hostingPrice)}</span>
                      </div>
                    ) : null}
                    <div className="mt-1 flex justify-between gap-3 border-[#ece9e2] border-t pt-2 font-medium">
                      <span>Total agora</span>
                      <span>{brl(total)}</span>
                    </div>
                    <p className="text-[#6e6b65] text-xs">
                      O site é publicado assim que o pagamento for confirmado.
                    </p>
                  </div>
                ) : null}

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
                      ) : total > 0 ? (
                        <CreditCard className="size-[15px]" />
                      ) : null}
                      {pending
                        ? "Enviando..."
                        : total > 0
                          ? `Pagar ${brl(total)}`
                          : "Publicar"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[#6e6b65] text-sm">
                Para publicar você precisa de uma VPS contratada no Atlas ou da
                hospedagem do Atlas, que ainda não está disponível.{" "}
                <a className="underline" href="/vps">
                  Ver planos de VPS
                </a>
                .
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
