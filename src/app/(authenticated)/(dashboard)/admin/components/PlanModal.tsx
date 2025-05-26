"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPlan } from "@/app/actions";
import { CgSpinner } from "react-icons/cg";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type Plan } from "@/lib/db/schema";

export function PlanModal() {
  const [open, setOpen] = useState(false);
  const [state, doCreate, isPending] = useActionState(createPlan, undefined);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(() => {
      const planInput: Omit<Plan, "id" | "createdAt" | "updatedAt"> = {
        name: formData.get("name")!.toString(),
        description: formData.get("description")!.toString(),
        price: +formData.get("price")!,
        maxSites: parseInt(formData.get("maxSites") as string),
        maxStorage: parseFloat(formData.get("maxStorage") as string),
        ssl: formData.get("ssl") === "on",
        backup: formData.get("backup") === "on",
        email: formData.get("email") === "on",
        cdn: formData.get("cdn") === "on",
        supportPriority: formData.get("supportPriority") === "on",
        featured: formData.get("featured") === "on",
      };
      doCreate(planInput);
    });
  }

  useEffect(() => {
    if (state && (state as any).status === "success") {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Plano</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Plano</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Nome" required />
          <Input name="description" placeholder="Descrição" required />
          <Input
            name="price"
            type="number"
            step="0.01"
            placeholder="Preço"
            required
          />
          <Input
            name="maxSites"
            type="number"
            placeholder="Max Sites"
            required
          />
          <Input
            name="maxStorage"
            type="number"
            step="0.1"
            placeholder="Max Storage (GB)"
            required
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
              {!isPending ? (
                "Criar Plano"
              ) : (
                <CgSpinner className="w-4 h-4 mx-auto animate-spin" />
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
