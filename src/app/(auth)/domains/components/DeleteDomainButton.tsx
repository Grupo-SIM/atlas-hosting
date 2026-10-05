"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmActionButton } from "@/components/ui/ConfirmActionButton";
import { useToast } from "@/hooks/use-toast";
import { deleteDomain } from "../delete-actions";
import { useDomainList } from "./domain-list-context";

export function DeleteDomainButton({ domainId, domainName }: { domainId: string; domainName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const { removeDomain } = useDomainList();

  return (
    <ConfirmActionButton
      className="shrink-0 cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed"
      confirmation={`Apagar ${domainName} do painel Atlas? Clique novamente em até 3 segundos. Registro, DNS e hospedagem permanecem no provedor.`}
      disabled={pending}
      label={`Apagar domínio ${domainName}`}
      onConfirm={async () => {
        setPending(true);
        try {
          const result = await deleteDomain(domainId);
          toast({ title: result.success ? "Domínio apagado" : "Não foi possível apagar", description: result.message, variant: result.success ? "default" : "destructive" });
          if (result.success) {
            removeDomain(domainId);
            router.refresh();
          }
        } catch {
          toast({ title: "Não foi possível apagar", description: "Tente novamente em instantes.", variant: "destructive" });
        } finally {
          setPending(false);
        }
      }}
      size="icon"
      variant="outline"
    >
      <Trash2 className="h-4 w-4" />
    </ConfirmActionButton>
  );
}
