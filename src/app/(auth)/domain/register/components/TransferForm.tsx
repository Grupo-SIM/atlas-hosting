"use client";

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

  useEffect(() => {
    if (state?.status === "success") {
      toast({
        description: state.message,
        title: "Sucesso!",
        variant: "default",
      });
      // Clear the form after successful submission
      formRef.current?.reset();
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
    </form>
  );
}
