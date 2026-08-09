"use client";

import { Check, Copy, ExternalLink, RefreshCw, Server } from "lucide-react";
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
import { verifyAtlasNameservers } from "../../domain/register/transfer-actions";
import { enableAtlasDns, keepExternalDns } from "./actions";

export function DomainDnsControls({
  connectionStatus,
  canSwitchMode,
  dnsMode,
  domainId,
  nameservers,
}: {
  connectionStatus: string;
  canSwitchMode: boolean;
  dnsMode: string;
  domainId: string;
  nameservers: string[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const run = (
    action: () => Promise<{
      message: string;
      success?: boolean;
      status?: string;
    }>
  ) =>
    startTransition(async () => {
      const result = await action();
      if (result.success || result.status === "success")
        toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });

  useEffect(() => {
    if (dnsMode !== "atlas" || connectionStatus !== "awaiting_nameservers")
      return;
    const timer = window.setInterval(async () => {
      const result = await verifyAtlasNameservers(domainId);
      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      }
    }, 30_000);
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
            O Atlas exibe apenas registros detectáveis publicamente e não altera
            sua zona.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={pending}
            onClick={() => run(() => enableAtlasDns(domainId))}
          >
            <Server className="mr-2 h-4 w-4" />
            Gerenciar DNS pelo Atlas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nameservers Atlas</CardTitle>
        <CardDescription>
          {connectionStatus === "connected"
            ? "Conexão ativa e verificada."
            : "Substitua todos os nameservers atuais pelos abaixo e salve."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {nameservers.map(ns => (
            <div
              className="flex items-center justify-between rounded-md border bg-muted/30 p-3 font-mono text-sm"
              key={ns}
            >
              <span>{ns}</span>
              <Button
                onClick={() => navigator.clipboard.writeText(ns)}
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
              onClick={() => run(() => verifyAtlasNameservers(domainId))}
            >
              {pending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Verificar nameservers
            </Button>
          )}
          {canSwitchMode && (
            <Button
              disabled={pending}
              onClick={() => run(() => keepExternalDns(domainId))}
              variant="outline"
            >
              Já movi o DNS para outro provedor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
