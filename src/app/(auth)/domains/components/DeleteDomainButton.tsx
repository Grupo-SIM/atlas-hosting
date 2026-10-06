"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteDomain } from "../delete-actions";
import { useDomainList } from "./domain-list-context";

export function DeleteDomainButton({ domainId, domainName, isExternal = false, hasManagedZone = false }: { domainId: string; domainName: string; isExternal?: boolean; hasManagedZone?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const { removeDomain } = useDomainList();

  return (
    <Dialog onOpenChange={value => { if (!pending) setOpen(value); }} open={open}>
      <DialogTrigger asChild>
        <Button aria-label={`Apagar domínio ${domainName}`} className="shrink-0 cursor-pointer border-destructive/40 text-destructive hover:bg-destructive/10" size="icon" variant="outline">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apagar {domainName} do Atlas?</DialogTitle>
          <DialogDescription>
            {hasManagedZone ? "A zona DNS e todos os registros gerenciados pelo Atlas serão apagados, junto do vínculo e das permissões no painel." : "O vínculo e as permissões do domínio serão removidos do painel. O DNS externo permanece no provedor atual."} A hospedagem e o registro no fornecedor não serão cancelados.
          </DialogDescription>
        </DialogHeader>
        {isExternal ? (
          <div className="space-y-3 text-sm">
            {hasManagedZone && <p>Antes de continuar, troque os nameservers no registrador original e configure os registros no novo DNS. Sem essa troca, seu site e e-mail podem parar de funcionar. Você pode continuar sem comprovar a troca.</p>}
            <p>Para voltar ao Atlas, realize o fluxo de conectar domínio novamente; registros DNS apagados não têm restauração automática.</p>
          </div>
        ) : (
          <p className="text-sm">A exclusão exige vigência paga encerrada, renovação automática desativada e ausência de cobrança ou transferência pendente. A recuperação de um registro expirado depende das opções oferecidas pelo registrador, sem garantia de disponibilidade ou prazo.</p>
        )}
        <DialogFooter>
          <Button disabled={pending} onClick={() => setOpen(false)} variant="outline">Cancelar</Button>
          <Button className="cursor-pointer" disabled={pending} variant="destructive"
            onClick={async () => {

        setPending(true);
        try {
          const result = await deleteDomain(domainId);
          toast({ title: result.success ? "Domínio apagado" : "Não foi possível apagar", description: result.message, variant: result.success ? "default" : "destructive" });
          if (result.success) {
            setOpen(false);
            removeDomain(domainId);
            router.refresh();
          }
        } catch {
          toast({ title: "Não foi possível apagar", description: "Tente novamente em instantes.", variant: "destructive" });
        } finally {
          setPending(false);
        }
      }}
          >
            {pending ? "Apagando…" : (hasManagedZone ? "Apagar domínio e DNS" : "Apagar vínculo do domínio")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
