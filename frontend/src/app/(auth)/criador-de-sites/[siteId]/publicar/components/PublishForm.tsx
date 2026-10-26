"use client";

import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
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
import { publishSite } from "../../../publish-actions";

interface Props {
  atlasVmEnabled: boolean;
  /** Domínio base dos subdomínios grátis; `null` quando o Atlas ainda não configurou. */
  baseDomain: string | null;
  domains: string[];
  publication: {
    domain: string;
    kind: "domain" | "subdomain";
    lastError: string | null;
    status: "failed" | "published";
    target: "atlas_vm" | "user_vps";
  } | null;
  servers: { id: string; ip: string; name: string }[];
  siteId: string;
}

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export default function PublishForm({
  atlasVmEnabled,
  baseDomain,
  domains,
  publication,
  servers,
  siteId,
}: Props) {
  const [kind, setKind] = useState<"domain" | "subdomain">(
    baseDomain ? "subdomain" : "domain"
  );
  const [label, setLabel] = useState("");
  const [domain, setDomain] = useState(domains[0] ?? "");
  const [target, setTarget] = useState<"atlas_vm" | "user_vps">(
    atlasVmEnabled ? "atlas_vm" : "user_vps"
  );
  const [vpsNodeId, setVpsNodeId] = useState(servers[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const passwordId = useId();

  const canPublish =
    (kind === "subdomain" ? label.length > 0 : domain.length > 0) &&
    (target === "atlas_vm" ? atlasVmEnabled : vpsNodeId.length > 0);

  const submit = () =>
    startTransition(async () => {
      const result = await publishSite({
        domain,
        kind,
        label,
        password: target === "user_vps" ? password : undefined,
        siteId,
        target,
        vpsNodeId,
      });
      if (result.ok) {
        toast.success(`Site publicado em ${result.domain}`);
        setPassword("");
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div className="space-y-6">
      {publication ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {publication.status === "published"
                ? "Site no ar"
                : "Última tentativa falhou"}
            </CardTitle>
            <CardDescription>{publication.domain}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {publication.status === "failed" && publication.lastError ? (
              <p className="text-destructive">{publication.lastError}</p>
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
          </CardContent>
        </Card>
      ) : null}

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
              onChange={e => setKind(e.target.value as "domain" | "subdomain")}
              value={kind}
            >
              {baseDomain ? (
                <option value="subdomain">Subdomínio grátis do Atlas</option>
              ) : null}
              <option value="domain">Domínio da minha conta</option>
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
                  Você não tem domínios com DNS gerenciado pelo Atlas. Registre
                  ou conecte um em Domínios.
                </p>
              )
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
              {atlasVmEnabled ? (
                <option value="atlas_vm">Servidor do Atlas</option>
              ) : null}
              <option value="user_vps">Minha VPS</option>
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
                  Você ainda não tem uma VPS na conta.
                </p>
              )
            ) : null}
          </div>

          <Button disabled={pending || !canPublish} onClick={submit}>
            {pending ? "Publicando..." : "Publicar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
