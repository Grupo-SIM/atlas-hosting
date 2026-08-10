"use client";

import { Check, Cloud, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
  startCloudflareMigration,
} from "./actions";

export function DomainDnsControls({
  dnsMode,
  domainId,
  nameservers,
  registrarProvider,
}: {
  dnsMode: string;
  domainId: string;
  nameservers: string[];
  registrarProvider: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
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

  const managed = dnsMode !== "external";
  const needsSetup = managed && nameservers.length === 0;

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
    </div>
  );
}
