"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDomainForTransfer } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export function TransferForm({ defaultDomain }: { defaultDomain?: string }) {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(addDomainForTransfer, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.status === "success") {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "default",
      });
      // Clear the form after successful submission
      formRef.current?.reset();
    } else if (state?.status === "error") {
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Input
        name="domain"
        placeholder="Digite o domínio que deseja transferir (ex: meudominio.com)"
        className="w-full"
        defaultValue={defaultDomain || ""}
        required
        disabled={isPending}
      />
      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? "Adicionando..." : "Adicionar Domínio"}
      </Button>
    </form>
  );
}
