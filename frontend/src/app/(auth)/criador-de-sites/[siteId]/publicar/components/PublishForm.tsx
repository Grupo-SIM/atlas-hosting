"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unpublishSite } from "../../../publish-actions";
import {
  getPublishJobStatus,
  startPublishCheckout,
} from "../../../publish-checkout-actions";
import DomainSearchPicker, {
  brl,
  type DomainOffer,
} from "../../components/DomainSearchPicker";

interface Props {
  /** Mensalidade da hospedagem na VM do Atlas; `null` = opção desligada. */
  atlasVmMonthlyBrl: number | null;
  /** Domínio base dos subdomínios grátis; `null` quando o Atlas ainda não configurou. */
  baseDomain: string | null;
  domains: string[];
  /** Assinatura da hospedagem deste site, quando existe. */
  hosting: {
    amountBrl: number;
    status: "active" | "past_due" | "suspended" | "cancelled";
  } | null;
  publication: {
    domain: string;
    kind: "domain" | "subdomain";
    lastError: string | null;
    status: "failed" | "published" | "suspended";
    target: "atlas_vm" | "user_vps";
  } | null;
  /** Só VPS contratadas no Atlas e com assinatura em dia. */
  servers: { id: string; ip: string; name: string }[];
  siteId: string;
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export default function PublishForm({
  atlasVmMonthlyBrl,
  baseDomain,
  domains,
  hosting,
  publication,
  servers,
  siteId,
}: Props) {
  const atlasVmEnabled = atlasVmMonthlyBrl !== null;
  const [kind, setKind] = useState<"buy" | "domain" | "subdomain">(
    baseDomain ? "subdomain" : domains.length > 0 ? "domain" : "buy"
  );
  const [label, setLabel] = useState("");
  const [domain, setDomain] = useState(domains[0] ?? "");
  const [offer, setOffer] = useState<DomainOffer | null>(null);
  const [target, setTarget] = useState<"atlas_vm" | "user_vps">(
    servers.length > 0 ? "user_vps" : "atlas_vm"
  );
  const [vpsNodeId, setVpsNodeId] = useState(servers[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const passwordId = useId();
  const [confirmingDown, setConfirmingDown] = useState(false);
  const [downPassword, setDownPassword] = useState("");
  const [waitingPayment, setWaitingPayment] = useState(false);

  // Hospedagem já paga: republicar não cobra de novo.
  const hostingPaid = Boolean(hosting && hosting.status !== "cancelled");
  const hostingPrice =
    target === "atlas_vm" && !hostingPaid ? atlasVmMonthlyBrl : null;
  const domainPrice = kind === "buy" ? (offer?.priceBrl ?? null) : null;
  const total = (hostingPrice ?? 0) + (domainPrice ?? 0);

  useEffect(() => {
    if (!waitingPayment) return;
    const timer = setInterval(async () => {
      const status = await getPublishJobStatus(siteId);
      if (!status.ok) return;
      if (status.publishedDomain) {
        setWaitingPayment(false);
        toast.success(`Site publicado em ${status.publishedDomain}`);
        window.location.reload();
        return;
      }
      if (status.job?.status === "failed") {
        setWaitingPayment(false);
        toast.error(
          status.job.error ??
            "O pagamento foi confirmado, mas a publicação falhou."
        );
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [siteId, waitingPayment]);

  const takeDown = () =>
    startTransition(async () => {
      const result = await unpublishSite({
        password: downPassword || undefined,
        siteId,
      });
      if (result.ok) {
        toast.success("Site tirado do ar. O endereço está livre de novo.");
        setDownPassword("");
        // A publicação sumiu: recarrega os dados do servidor.
        window.location.reload();
      } else {
        toast.error(result.error);
      }
    });

  const canPublish =
    (kind === "subdomain"
      ? label.length > 0
      : kind === "buy"
        ? Boolean(offer)
        : domain.length > 0) &&
    (target === "atlas_vm" ? atlasVmEnabled : vpsNodeId.length > 0);

  const submit = () =>
    startTransition(async () => {
      const result = await startPublishCheckout({
        domain: kind === "buy" ? offer?.domain : domain,
        kind,
        label,
        password: target === "user_vps" ? password : undefined,
        siteId,
        target,
        vpsNodeId,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPassword("");
      if (result.published) {
        toast.success(`Site publicado em ${result.domain}`);
        window.location.reload();
        return;
      }
      if (result.checkoutUrl) {
        setWaitingPayment(true);
        window.open(result.checkoutUrl, "_blank", "noopener");
      }
    });

  const statusTitle =
    publication?.status === "published"
      ? "Site no ar"
      : publication?.status === "suspended"
        ? "Site suspenso"
        : "Última tentativa falhou";

  return (
    <div className="space-y-6">
      {publication ? (
        <Card>
          <CardHeader>
            <CardTitle>{statusTitle}</CardTitle>
            <CardDescription>{publication.domain}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {publication.status === "failed" && publication.lastError ? (
              <p className="text-destructive">{publication.lastError}</p>
            ) : null}
            {publication.status === "suspended" ? (
              <p className="text-muted-foreground">
                A hospedagem está suspensa por falta de pagamento e o endereço
                mostra uma página de aviso. Os arquivos e o DNS continuam no
                lugar: pague a fatura em aberto e o site volta ao ar sozinho.
              </p>
            ) : null}
            {publication.status === "published" ? (
              <>
                <a
                  className="text-primary underline"
                  href={`https://${publication.domain}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Abrir {publication.domain}
                </a>
                <p className="text-muted-foreground">
                  O certificado HTTPS é emitido automaticamente no primeiro
                  acesso, assim que o DNS propagar (pode levar alguns minutos).
                </p>
              </>
            ) : null}
            {hosting && hosting.status !== "cancelled" ? (
              <p className="text-muted-foreground">
                Hospedagem no Atlas: {brl(hosting.amountBrl)}/mês
                {hosting.status === "past_due"
                  ? " — fatura em aberto, o site é suspenso se não for paga."
                  : ""}
              </p>
            ) : null}
            <Button
              disabled={pending}
              onClick={() => setConfirmingDown(true)}
              size="sm"
              variant="outline"
            >
              Tirar do ar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <AlertDialog onOpenChange={setConfirmingDown} open={confirmingDown}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tirar {publication?.domain} do ar?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os arquivos publicados e o endereço DNS serão removidos e o nome
              fica livre para outro site. O conteúdo do site continua salvo no
              editor e você pode publicar de novo quando quiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {publication?.target === "user_vps" ? (
            <div className="space-y-2">
              <Label htmlFor={`${passwordId}-down`}>
                Senha do servidor (root)
              </Label>
              <Input
                autoComplete="off"
                id={`${passwordId}-down`}
                onChange={e => setDownPassword(e.target.value)}
                type="password"
                value={downPassword}
              />
              <p className="text-muted-foreground text-xs">
                Usada só agora; não é gravada. Pode deixar em branco se a VPS
                foi criada pelo Atlas.
              </p>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={takeDown}>
              Tirar do ar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>
            {publication ? "Publicar novamente" : "Onde publicar"}
          </CardTitle>
          <CardDescription>
            Publicamos o que está salvo no editor. Salve antes de publicar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Endereço</Label>
            <select
              className={selectClass}
              onChange={e =>
                setKind(e.target.value as "buy" | "domain" | "subdomain")
              }
              value={kind}
            >
              {baseDomain ? (
                <option value="subdomain">Subdomínio grátis do Atlas</option>
              ) : null}
              <option value="domain">Domínio da minha conta</option>
              <option value="buy">Comprar um domínio novo</option>
            </select>

            {kind === "subdomain" && baseDomain ? (
              <div className="flex items-center gap-2">
                <Input
                  onChange={e => setLabel(e.target.value.toLowerCase())}
                  placeholder="meusite"
                  value={label}
                />
                <span className="whitespace-nowrap text-muted-foreground text-sm">
                  .{baseDomain}
                </span>
              </div>
            ) : null}

            {kind === "domain" ? (
              domains.length > 0 ? (
                <select
                  className={selectClass}
                  onChange={e => setDomain(e.target.value)}
                  value={domain}
                >
                  {domains.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Você não tem domínios com DNS gerenciado pelo Atlas. Use a
                  opção de comprar um domínio novo ou conecte um em Domínios.
                </p>
              )
            ) : null}

            {kind === "buy" ? (
              <DomainSearchPicker
                fieldClassName={`${selectClass} flex-1`}
                onSelect={setOffer}
                selected={offer}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Servidor</Label>
            <select
              className={selectClass}
              onChange={e =>
                setTarget(e.target.value as "atlas_vm" | "user_vps")
              }
              value={target}
            >
              {servers.length > 0 ? (
                <option value="user_vps">Minha VPS do Atlas</option>
              ) : null}
              {atlasVmEnabled ? (
                <option value="atlas_vm">
                  Hospedagem do Atlas — {brl(atlasVmMonthlyBrl)}/mês
                </option>
              ) : null}
            </select>

            {target === "user_vps" ? (
              servers.length > 0 ? (
                <>
                  <select
                    className={selectClass}
                    onChange={e => setVpsNodeId(e.target.value)}
                    value={vpsNodeId}
                  >
                    {servers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.ip})
                      </option>
                    ))}
                  </select>
                  <Label htmlFor={passwordId}>Senha do servidor (root)</Label>
                  <Input
                    autoComplete="off"
                    id={passwordId}
                    onChange={e => setPassword(e.target.value)}
                    type="password"
                    value={password}
                  />
                  <p className="text-muted-foreground text-xs">
                    Usada só durante a publicação para enviar os arquivos. Não é
                    gravada. Se a VPS foi criada pelo Atlas, pode deixar em
                    branco. A VPS precisa ter o caddy-docker-proxy com /srv/www
                    e /opt/caddy/Caddyfile.base.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Você não tem VPS contratada no Atlas com assinatura em dia.
                </p>
              )
            ) : (
              <p className="text-muted-foreground text-xs">
                Nós cuidamos do servidor e do HTTPS. Cobrança mensal por site,
                cancela quando quiser.
              </p>
            )}
          </div>

          {total > 0 ? (
            <div className="space-y-1.5 rounded-md border p-3 text-sm">
              {domainPrice !== null && offer ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Registro de {offer.domain} (1 ano)
                  </span>
                  <span>{brl(domainPrice)}</span>
                </div>
              ) : null}
              {hostingPrice !== null ? (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    Hospedagem (1º mês)
                  </span>
                  <span>{brl(hostingPrice)}</span>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 border-t pt-2 font-medium">
                <span>Total agora</span>
                <span>{brl(total)}</span>
              </div>
              <p className="text-muted-foreground text-xs">
                O site é publicado assim que o pagamento for confirmado.
              </p>
            </div>
          ) : null}

          {waitingPayment ? (
            <p className="text-muted-foreground text-sm">
              Abrimos o checkout em outra aba. Assim que o pagamento for
              confirmado, publicamos o site automaticamente.
            </p>
          ) : null}

          <Button disabled={pending || !canPublish} onClick={submit}>
            {pending
              ? "Enviando..."
              : total > 0
                ? `Pagar ${brl(total)} e publicar`
                : "Publicar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
