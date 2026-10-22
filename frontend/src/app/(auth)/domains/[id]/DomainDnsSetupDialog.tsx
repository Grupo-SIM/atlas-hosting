"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  ListChecks,
  RefreshCw,
  ServerCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { CloudflareDnsRecord } from "@/lib/server/apis/cloudflare";
import { type ModeActionResult, refreshCloudflareConnection } from "./actions";
import { DnsScanReview } from "./DnsScanReview";

export type DomainDnsSetupStep = "nameservers" | "records" | null;

export function getDomainDnsSetupStep(
  connectionStatus: string,
  dnsImportStatus: string,
  nameservers: string[]
): DomainDnsSetupStep {
  if (connectionStatus === "connected" || nameservers.length === 0) return null;
  return dnsImportStatus === "complete" ? "nameservers" : "records";
}

export function shouldOpenDomainDnsSetup(
  initiallyOpen: boolean,
  step: DomainDnsSetupStep
) {
  return initiallyOpen && step === "records";
}

export function DomainDnsSetupDialog({
  connectionStatus,
  dnsImportStatus,
  domainId,
  initiallyOpen = false,
  lastDnsError,
  nameservers,
  scannedRecords,
}: {
  connectionStatus: string;
  dnsImportStatus: string;
  domainId: string;
  initiallyOpen?: boolean;
  lastDnsError: string | null;
  nameservers: string[];
  scannedRecords: CloudflareDnsRecord[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const step = getDomainDnsSetupStep(
    connectionStatus,
    dnsImportStatus,
    nameservers
  );
  const [open, setOpen] = useState(() =>
    shouldOpenDomainDnsSetup(initiallyOpen, step)
  );
  const openRef = useRef(open);
  const [pending, startTransition] = useTransition();
  const [activationFeedback, setActivationFeedback] = useState<{
    message: string;
    status: "error" | "pending" | "success";
  } | null>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const verify = () =>
    startTransition(async () => {
      try {
        const result = await refreshCloudflareConnection(domainId, true);
        const status = result.status || (result.success ? "success" : "error");
        setActivationFeedback({ message: result.message, status });
        if (status === "success") setOpen(false);
        router.refresh();
      } catch {
        const result: ModeActionResult = {
          message: "Não foi possível comunicar com o DNS do Atlas.",
          status: "error",
          success: false,
        };
        setActivationFeedback({
          message: result.message,
          status: "error",
        });
      }
    });

  useEffect(() => {
    if (
      connectionStatus !== "awaiting_activation" &&
      connectionStatus !== "awaiting_nameservers"
    ) return;
    const timer = window.setInterval(async () => {
      const result = await refreshCloudflareConnection(domainId);
      const status = result.status || (result.success ? "success" : "error");
      setActivationFeedback({ message: result.message, status });
      if (status === "success") {
        setOpen(false);
        if (!openRef.current)
          toast({ description: result.message, title: "DNS ativado" });
      }
      router.refresh();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [connectionStatus, domainId, router, toast]);

  if (!step) return null;
  const displayedFeedback =
    activationFeedback ||
    (lastDnsError
      ? {
          message: lastDnsError.replace(
            /cloudflare/gi,
            "serviço de DNS do Atlas"
          ),
          status: "error" as const,
        }
      : null);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          {step === "records" ? (
            <ListChecks className="mr-2 h-4 w-4" />
          ) : (
            <ServerCog className="mr-2 h-4 w-4" />
          )}
          {step === "records" ? "Revisar registros" : "Configurar nameservers"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        {step === "records" ? (
          <>
            <DialogHeader>
              <DialogTitle>Revisar registros encontrados</DialogTitle>
              <DialogDescription>
                Confirme os registros que serão importados antes de alterar os
                nameservers do domínio.
              </DialogDescription>
            </DialogHeader>
            {displayedFeedback?.status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Não foi possível importar os registros</AlertTitle>
                <AlertDescription>
                  {displayedFeedback.message} Tente novamente.
                </AlertDescription>
              </Alert>
            )}
            <DnsScanReview
              domainId={domainId}
              embedded
              onComplete={() => setOpen(true)}
              records={scannedRecords}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Configurar nameservers do Atlas</DialogTitle>
              <DialogDescription>
                Substitua todos os nameservers atuais pelos endereços abaixo e
                verifique a ativação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                <li>Acesse a área de nameservers no seu registrador</li>
                <li>Remova todos os nameservers atuais</li>
                <li>Adicione somente os endereços abaixo e salve</li>
                <li>Volte ao Atlas e verifique a ativação</li>
              </ol>
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
                  <AlertDescription>
                    {displayedFeedback.message}
                  </AlertDescription>
                </Alert>
              )}
              <Button disabled={pending} onClick={verify}>
                {pending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {pending
                  ? "Verificando..."
                  : activationFeedback
                    ? "Verificar novamente"
                    : "Verificar ativação"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
