"use client";

import { Loader2, Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateVpsPaymentLinkCustomerAction } from "./actions";
import { type Customer, CustomerCombobox } from "./CustomerCombobox";

export function EditLinkCustomerButton({
  id,
  customers,
  currentCustomerId,
}: {
  id: string;
  customers: Customer[];
  currentCustomerId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState(currentCustomerId ?? "none");
  const [isPending, startTransition] = useTransition();

  const dirty = customerId !== (currentCustomerId ?? "none");

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateVpsPaymentLinkCustomerAction(id, customerId);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Cliente do link atualizado.");
        setOpen(false);
      } catch {
        toast.error("Erro ao atualizar o cliente do link.");
      }
    });
  };

  return (
    <Dialog
      onOpenChange={o => {
        setOpen(o);
        if (o) setCustomerId(currentCustomerId ?? "none");
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          size="icon"
          title="Trocar cliente do link"
          variant="ghost"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar cliente do link</DialogTitle>
          <DialogDescription>
            A fatura pendente, se houver, passa junto para o novo cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Cliente</Label>
          <CustomerCombobox
            customers={customers}
            disabled={isPending}
            onChange={setCustomerId}
            value={customerId}
          />
        </div>

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button disabled={isPending || !dirty} onClick={handleSave}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
