"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFeature } from "@/app/actions";
import { CgSpinner } from "react-icons/cg";

export function FeatureModal() {
  const [open, setOpen] = useState(false);
  const [state, doCreate, isPending] = useActionState(createFeature, { status: "idle", message: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;

    startTransition(() => {
        doCreate({
            description: form.description.value,
            reference: form.reference.value,
        });
    });
  }

  useEffect(() => {
    if (state.status === "success") {
        setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar Recurso</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Recurso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="description" placeholder="Descrição" required />
          <Input name="reference" placeholder="Referência" />
          <DialogFooter>
            <Button type="submit" className="w-30">
                {!isPending ? (
                    "Criar Recurso"
                ): (
                    <CgSpinner className="w-4 h-4 mx-auto animate-spin" />
                )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}