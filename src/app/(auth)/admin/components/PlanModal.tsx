"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { createPlan } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Plan } from "@/lib/db/schema";

export function PlanModal() {
  const [open, setOpen] = useState(false);
  const [state, doCreate, isPending] = useActionState(createPlan, undefined);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const {
      name,
      description,
      price,
      maxSites,
      maxStorage,
      ssl,
      backup,
      email,
      cdn,
      supportPriority,
      featured,
    } = Object.fromEntries(formData.entries());

    if (
      !name ||
      !description ||
      !price ||
      !maxSites ||
      !maxStorage ||
      Number.isNaN(Number(price)) ||
      Number.isNaN(Number(maxSites)) ||
      Number.isNaN(Number(maxStorage))
    ) {
      return;
    }

    startTransition(() => {
      const planInput: Omit<Plan, "id" | "createdAt" | "updatedAt"> = {
        backup: backup === "on",
        cdn: cdn === "on",
        description: description.toString(),
        email: email === "on",
        featured: featured === "on",
        maxSites: Number.parseInt(maxSites as string, 10),
        maxStorage: Number.parseFloat(maxStorage as string),
        name: name.toString(),
        price: +price,
        ssl: ssl === "on",
        supportPriority: supportPriority === "on",
      };
      doCreate(planInput);
    });
  }

  useEffect(() => {
    if (state && state.status === "success") {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild={true}>
        <Button>Adicionar Plano</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Plano</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input name="name" placeholder="Nome" required={true} />
          <Input name="description" placeholder="Descrição" required={true} />
          <Input
            name="price"
            placeholder="Preço"
            required={true}
            step="0.01"
            type="number"
          />
          <Input
            name="maxSites"
            placeholder="Max Sites"
            required={true}
            type="number"
          />
          <Input
            name="maxStorage"
            placeholder="Max Storage (GB)"
            required={true}
            step="0.1"
            type="number"
          />
          <div className="flex items-center space-x-2">
            <Checkbox id="modal-ssl" name="ssl" />
            <Label htmlFor="modal-ssl">SSL Grátis</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="modal-backup" name="backup" />
            <Label htmlFor="modal-backup">Backup</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="modal-email" name="email" />
            <Label htmlFor="modal-email">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="modal-cdn" name="cdn" />
            <Label htmlFor="modal-cdn">CDN</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="modal-supportPriority" name="supportPriority" />
            <Label htmlFor="modal-supportPriority">Suporte Prioritário</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="modal-featured" name="featured" />
            <Label htmlFor="modal-featured">Destacado</Label>
          </div>
          <DialogFooter>
            <Button type="submit">
              {isPending ? (
                <CgSpinner className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Criar Plano"
              )}
            </Button>
            <DialogClose asChild={true}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
