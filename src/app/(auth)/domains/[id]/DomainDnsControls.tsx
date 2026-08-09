"use client";

import { Check, Cloud, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  keepExternalDns,
  refreshCloudflareConnection,
  startCloudflareMigration,
} from "./actions";

export function DomainDnsControls({
  connectionStatus,
  dnsImportStatus,
  dnsMode,
  domainId,
  nameservers,
  registrarProvider,
}: {
  connectionStatus: string;
  dnsImportStatus: string;
  dnsMode: string;
  domainId: string;
  nameservers: string[];
  registrarProvider: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<{ message: string; success: boolean }>) =>
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });

  useEffect(() => {
    if (dnsMode !== "cloudflare" || connectionStatus !== "awaiting_activation")
      return;
    const timer = window.setInterval(async () => {
      const result = await refreshCloudflareConnection(domainId);
      if (result.success) toast.success(result.message);
      router.refresh();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [connectionStatus, dnsMode, domainId, router]);

  if (dnsMode === "external") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" /> DNS no provedor atual
          </CardTitle>
          <CardDescription>
            O Atlas exibe apenas registros públicos detectáveis e não altera a
            zona.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={pending}
            onClick={() => run(() => startCloudflareMigration(domainId))}
          >
            <Cloud className="mr-2 h-4 w-4" /> Gerenciar DNS pelo Atlas
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (
    dnsMode === "legacy_plesk" ||
    (dnsMode === "cloudflare" && nameservers.length === 0)
  ) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Migração para Cloudflare</CardTitle>
          <CardDescription>
            Criaremos a zona e encontraremos registros existentes. Os
            nameservers só serão alterados após sua revisão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={pending}
            onClick={() => run(() => startCloudflareMigration(domainId))}
          >
            <Cloud className="mr-2 h-4 w-4" /> Iniciar migração assistida
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (dnsImportStatus !== "complete") return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nameservers Cloudflare</CardTitle>
        <CardDescription>
          {connectionStatus === "connected"
            ? "Delegação ativa e confirmada pela Cloudflare."
            : registrarProvider === "namecheap"
              ? "A Atlas já enviou estes nameservers à Namecheap."
              : "Substitua todos os nameservers atuais pelos abaixo."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {nameservers.map(nameserver => (
            <div
              className="flex items-center justify-between rounded-md border bg-muted/30 p-3 font-mono text-sm"
              key={nameserver}
            >
              <span>{nameserver}</span>
              <Button
                onClick={() => navigator.clipboard.writeText(nameserver)}
                size="icon"
                variant="ghost"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {connectionStatus !== "connected" && (
            <Button
              disabled={pending}
              onClick={() => run(() => refreshCloudflareConnection(domainId))}
            >
              {pending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}{" "}
              Verificar ativação
            </Button>
          )}
          {registrarProvider !== "namecheap" && (
            <Button
              disabled={pending}
              onClick={() => run(() => keepExternalDns(domainId))}
              variant="outline"
            >
              Manter em outro provedor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
