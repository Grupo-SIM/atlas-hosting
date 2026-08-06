"use client";

import { Copy } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { addExternalDomainForTransfer } from "../transfer-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function TransferForm({ defaultDomain }: { defaultDomain?: string }) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(
    addExternalDomainForTransfer,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  const copyVerificationValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ description: `${label} copiado para a área de transferência.`, title: "Copiado" });
    } catch {
      toast({ description: "Não foi possível copiar. Selecione e copie manualmente.", title: "Erro", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (state?.status === "success") {
      toast({
        description: state.message,
        title: "Sucesso!",
        variant: "default",
      });
      if (!state.verification) formRef.current?.reset();
    } else if (state?.status === "error") {
      toast({
        description: state.message,
        title: "Erro",
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      <Input
        className="w-full"
        defaultValue={defaultDomain || ""}
        disabled={isPending}
        name="domain"
        placeholder="Digite o domínio que deseja transferir (ex: meudominio.com)"
        required
      />
      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Adicionando..." : "Adicionar Domínio"}
      </Button>

      {state?.verification && (
        <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <div>
            <p className="font-semibold">Crie este registro TXT no DNS atual</p>
            <p className="mt-1 text-muted-foreground">
              Não altere A, MX ou nameservers. Depois, use o botão Verificar na lista de domínios pendentes.
            </p>
          </div>
          <div className="space-y-1 break-all rounded-md bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Host</p>
              <Button onClick={() => copyVerificationValue(state.verification?.host || "", "Host")} size="sm" type="button" variant="outline">
                <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
            <code className="text-xs">{state.verification.host}</code>
          </div>
          <div className="space-y-1 break-all rounded-md bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Valor</p>
              <Button onClick={() => copyVerificationValue(state.verification?.value || "", "Valor")} size="sm" type="button" variant="outline">
                <Copy className="mr-1 h-3.5 w-3.5" /> Copiar
              </Button>
            </div>
            <code className="text-xs">{state.verification.value}</code>
          </div>
        </div>
      )}
    </form>
  );
}
