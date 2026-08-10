"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Cloud,
  Copy,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  keepExternalDns,
  type ModeActionResult,
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
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [activationFeedback, setActivationFeedback] = useState<{
    message: string;
    status: "error" | "pending" | "success";
  } | null>(null);
  const run = (
    action: () => Promise<ModeActionResult>,
    onResult?: (result: ModeActionResult) => void
  ) =>
    startTransition(async () => {
      try {
        const result = await action();
        const status = result.status || (result.success ? "success" : "error");
        toast({
          description: result.message,
          title:
            status === "error"
              ? "Não foi possível concluir"
              : status === "pending"
                ? "Verificação concluída"
                : "Tudo certo",
          variant: status === "error" ? "destructive" : "default",
        });
        onResult?.(result);
        router.refresh();
      } catch {
        const result: ModeActionResult = {
          message: "Não foi possível comunicar com o DNS do Atlas.",
          status: "error",
          success: false,
        };
        toast({
          description: result.message,
          title: "Erro na verificação",
          variant: "destructive",
        });
        onResult?.(result);
      }
    });

  useEffect(() => {
    if (dnsMode !== "cloudflare" || connectionStatus !== "awaiting_activation")
      return;
    const timer = window.setInterval(async () => {
      const result = await refreshCloudflareConnection(domainId);
      const status = result.status || (result.success ? "success" : "error");
      setActivationFeedback({ message: result.message, status });
      if (status === "success") {
        toast({
          description: result.message,
          title: "DNS ativado",
        });
      }
      router.refresh();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [connectionStatus, dnsMode, domainId, router, toast]);

  const managed = dnsMode !== "external";
  const needsSetup = managed && nameservers.length === 0;
  const displayedFeedback =
    connectionStatus === "connected"
      ? {
          message: "Nameservers confirmados. O DNS do Atlas está ativo.",
          status: "success" as const,
        }
      : activationFeedback;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Como o Atlas deve cuidar do DNS?</CardTitle>
          <CardDescription>
            Você pode alterar esta escolha enquanto configura o domínio.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div
            className={`rounded-lg border p-4 ${
              managed ? "border-primary bg-muted/30" : "border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <Cloud className="mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="font-medium">Gerenciar DNS pelo Atlas</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Adicione, importe e edite todos os registros no Atlas.
                </p>
              </div>
            </div>
            {!managed && (
              <Button
                className="mt-3"
                disabled={pending}
                onClick={() => run(() => startCloudflareMigration(domainId))}
                size="sm"
              >
                Escolher este modo
              </Button>
            )}
            {managed && (
              <p className="mt-3 flex items-center gap-1 text-primary text-xs">
                <Check className="h-3.5 w-3.5" /> Selecionado
              </p>
            )}
          </div>
          <div
            className={`rounded-lg border p-4 ${
              !managed ? "border-primary bg-muted/30" : "border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="font-medium">Apenas acompanhar o domínio</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  O Atlas exibe somente informações públicas e não gerencia os
                  registros.
                </p>
              </div>
            </div>
            {!managed && (
              <p className="mt-3 flex items-center gap-1 text-primary text-xs">
                <Check className="h-3.5 w-3.5" /> Selecionado
              </p>
            )}
            {managed && registrarProvider !== "namecheap" && (
              <Button
                className="mt-3"
                disabled={pending}
                onClick={() => run(() => keepExternalDns(domainId))}
                size="sm"
                variant="outline"
              >
                Escolher este modo
              </Button>
            )}
            {managed && registrarProvider === "namecheap" && (
              <p className="mt-3 text-muted-foreground text-xs">
                Domínios adquiridos pelo Atlas usam o DNS do Atlas.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {needsSetup && (
        <Card>
          <CardHeader>
            <CardTitle>Preparar DNS no Atlas</CardTitle>
            <CardDescription>
              O Atlas localizará os registros atuais para você revisá-los antes
              da alteração dos nameservers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              disabled={pending}
              onClick={() => run(() => startCloudflareMigration(domainId))}
            >
              <Cloud className="mr-2 h-4 w-4" /> Iniciar configuração
            </Button>
          </CardContent>
        </Card>
      )}

      {managed && nameservers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure os nameservers do Atlas</CardTitle>
            <CardDescription>
              {connectionStatus === "connected"
                ? "Configuração ativa e confirmada pelo Atlas."
                : registrarProvider === "namecheap"
                  ? "O Atlas já enviou estes nameservers ao registrador."
                  : "Substitua todos os nameservers atuais pelos endereços abaixo."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dnsImportStatus !== "complete" && (
              <div className="rounded-md bg-muted p-3 text-sm">
                Revise os registros encontrados nesta página antes de concluir a
                troca. Os nameservers já estão disponíveis para a próxima etapa.
              </div>
            )}
            {registrarProvider !== "namecheap" &&
              connectionStatus !== "connected" && (
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                  <li>Acesse a área de nameservers no seu registrador</li>
                  <li>Remova todos os nameservers atuais</li>
                  <li>Adicione somente os endereços abaixo e salve</li>
                  <li>Volte ao Atlas e verifique a ativação</li>
                </ol>
              )}
            <div className="grid gap-2 sm:grid-cols-2">
              {nameservers.map(nameserver => (
                <div
                  className="flex items-center justify-between rounded-md border bg-muted/30 p-3 font-mono text-sm"
                  key={nameserver}
                >
                  <span>{nameserver}</span>
                  <Button
                    aria-label={`Copiar nameserver ${nameserver}`}
                    onClick={() => navigator.clipboard.writeText(nameserver)}
                    size="icon"
                    variant="ghost"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {displayedFeedback && (
              <Alert
                className={
                  displayedFeedback.status === "success"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : displayedFeedback.status === "pending"
                      ? "border-amber-500/50 bg-amber-500/10"
                      : undefined
                }
                variant={
                  displayedFeedback.status === "error"
                    ? "destructive"
                    : "default"
                }
              >
                {displayedFeedback.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : displayedFeedback.status === "pending" ? (
                  <Clock3 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {displayedFeedback.status === "success"
                    ? "Nameservers configurados corretamente"
                    : displayedFeedback.status === "pending"
                      ? "Ativação ainda pendente"
                      : "Falha ao verificar os nameservers"}
                </AlertTitle>
                <AlertDescription>{displayedFeedback.message}</AlertDescription>
              </Alert>
            )}
            {connectionStatus !== "connected" && (
              <Button
                disabled={pending}
                onClick={() =>
                  run(
                    () => refreshCloudflareConnection(domainId, true),
                    result =>
                      setActivationFeedback({
                        message: result.message,
                        status:
                          result.status ||
                          (result.success ? "success" : "error"),
                      })
                  )
                }
              >
                {pending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}{" "}
                {pending
                  ? "Verificando..."
                  : activationFeedback
                    ? "Verificar novamente"
                    : "Verificar ativação"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
