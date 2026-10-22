"use client";

import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { verifyExternalDomain } from "@/app/(auth)/domain/register/transfer-actions";
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

interface PendingDomainInstructionsDialogProps {
  domain: string;
  host: string;
  value: string;
}

export function PendingDomainInstructionsDialog({
  domain,
  host,
  value,
}: PendingDomainInstructionsDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const copyValue = async (label: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    const formData = new FormData();
    formData.set("domain", domain);

    try {
      const result = await verifyExternalDomain(null, formData);

      toast({
        description: result.message,
        title: result.isCorrect
          ? "Domínio verificado!"
          : "Verificação pendente",
        variant: result.isCorrect ? "default" : "destructive",
      });

      if (result.isCorrect && result.domainId) {
        router.push(`/domains/${result.domainId}?setup=records`);
      } else {
        router.refresh();
      }
    } catch {
      toast({
        description: "Não foi possível verificar o registro TXT.",
        title: "Erro",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const shortHost = host.replace(`.${domain}`, "");

  return (
    <Dialog>
      <DialogTrigger asChild={true}>
        <Button size="sm" variant="outline">
          Checar instruções
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Verificar {domain}</DialogTitle>
          <DialogDescription>
            Adicione este registro TXT no provedor atual para confirmar a
            propriedade do domínio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-medium text-sm">
              Adicione um registro do tipo TXT
            </p>
            <p className="text-muted-foreground text-xs">
              Não altere os outros registros ou nameservers durante esta
              verificação.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Nome/Host", shortHost],
              ["Conteúdo/Valor", value],
            ].map(([label, content]) => (
              <div className="rounded-md bg-muted/50 p-3" key={label}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium">{label}</span>
                  <Button
                    aria-label={`Copiar ${label.toLowerCase()}`}
                    onClick={() => copyValue(label, content)}
                    size="icon"
                    variant="ghost"
                  >
                    {copied === label ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <code className="break-all text-xs">{content}</code>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-xs">
            O primeiro campo também pode aparecer como &quot;Nome&quot; no seu
            provedor. Normalmente ele acrescenta
            <code className="mx-1">.{domain}</code>
            automaticamente; se pedir o nome completo, use
            <code className="ml-1">{host}</code>.
          </p>

          <Button
            className="w-full sm:w-auto"
            disabled={isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isVerifying ? "Verificando..." : "Verificar agora"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
