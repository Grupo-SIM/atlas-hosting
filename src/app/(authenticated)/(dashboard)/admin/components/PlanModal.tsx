"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPlan } from "@/app/actions";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FeatureModal } from "./FeatureModal";
import { CgSpinner } from "react-icons/cg";

export function PlanModal({ features }: { features: { id: string, description: string }[] }) {
  const [open, setOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [state, doCreate, isPending] = useActionState(createPlan, { status: "idle", message: "" });

  function handleFeatureSelect(value: string) {
    setSelectedFeatures((prev) =>
      prev.includes(value) ? prev.filter((fid) => fid !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;

    const formData = new FormData(form);

    startTransition(() => {
      doCreate({
        name: formData.get("name")!.toString(),
        description: formData.get("description")!.toString(),
        price: +(formData.get("price")!),
        features: selectedFeatures,
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
        <Button>Adicionar Plano</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Plano</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Nome" required />
          <Input name="description" placeholder="Descrição" required />
          <Input name="price" type="number" step="0.01" placeholder="Preço" required />
          <div>
            <label className="block mb-1 font-medium">Recursos</label>
            {features.length === 0 ? (
              <div className="py-6 flex justify-between items-center w-full">
                <div className="text-sm max-w-1/2 opacity-60">Nenhum recurso encontrado para adicionar ao plano</div>
                <FeatureModal />
              </div>
            ): (
              <>
                <Select onValueChange={handleFeatureSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedFeatures.length === 0 ? "Selecione os recursos" : `${selectedFeatures.length} selecionado(s)`} />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map((feature) => (
                      <SelectItem key={feature.id} value={feature.id}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.id)}
                            readOnly
                            className="mr-2"
                          />
                          {feature.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFeatures.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedFeatures.map(fid => {
                      const f = features.find(f => f.id === fid);
                      return f ? <span key={fid} className="px-2 py-1 bg-muted rounded text-xs">{f.description}</span> : null;
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">
              {!isPending ? (
                "Criar Plano"
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