"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellablePlan } from "@/lib/vps-sellable-plans";

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  vps: "Cloud VPS",
  vds: "VDS",
  "storage-vps": "Storage VPS",
};

type Customer = { id: string; name: string; email: string };

export function PaymentLinkForm({
  plans,
  customers,
  createAction,
}: {
  plans: SellablePlan[];
  customers: Customer[];
  createAction: (formData: FormData) => Promise<void>;
}) {
  const [planKey, setPlanKey] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [customerId, setCustomerId] = useState("none");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [allowPix, setAllowPix] = useState(false);

  const selectedPlan = plans.find((p) => `${p.productType}:${p.planId}` === planKey);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <form action={createAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <input type="hidden" name="productType" value={selectedPlan?.productType || ""} />
      <input type="hidden" name="planId" value={selectedPlan?.planId || ""} />

      <div className="space-y-2">
        <Label>Produto / Plano *</Label>
        <Popover open={planOpen} onOpenChange={setPlanOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={planOpen}
              className="w-full h-10 justify-between font-normal"
            >
              {selectedPlan ? (
                <span className="truncate">
                  {PRODUCT_TYPE_LABEL[selectedPlan.productType]} — {selectedPlan.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Buscar plano...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar produto ou plano..." />
              <CommandList>
                <CommandEmpty>Nenhum plano encontrado.</CommandEmpty>
                <CommandGroup>
                  {plans.map((p) => {
                    const key = `${p.productType}:${p.planId}`;
                    return (
                      <CommandItem
                        key={key}
                        value={`${PRODUCT_TYPE_LABEL[p.productType]} ${p.name}`}
                        onSelect={() => {
                          setPlanKey(key);
                          setPlanOpen(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", planKey === key ? "opacity-100" : "opacity-0")} />
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          <span className="text-xs text-muted-foreground">{PRODUCT_TYPE_LABEL[p.productType]}</span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="intervalMonths">Período (meses) *</Label>
        <Input
          name="intervalMonths"
          id="intervalMonths"
          type="number"
          min="1"
          step="1"
          required
          placeholder="Ex: 3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amountBrl">Valor por ciclo (R$) *</Label>
        <Input
          name="amountBrl"
          id="amountBrl"
          type="number"
          min="0.01"
          step="0.01"
          required
          placeholder="Ex: 89.90"
        />
      </div>

      <div className="space-y-2 md:col-span-2 lg:col-span-2">
        <Label>Vincular a cliente (opcional)</Label>
        <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={customerOpen}
              className="w-full h-10 justify-between font-normal"
            >
              {customerId !== "none" && selectedCustomer ? (
                <span className="truncate">
                  {selectedCustomer.name} ({selectedCustomer.email})
                </span>
              ) : (
                <span className="text-muted-foreground">Genérico — qualquer pessoa pode pagar</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar cliente..." />
              <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="none genérico qualquer"
                    onSelect={() => {
                      setCustomerId("none");
                      setCustomerOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", customerId === "none" ? "opacity-100" : "opacity-0")} />
                    Genérico — qualquer pessoa pode pagar
                  </CommandItem>
                  {customers.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`${c.name} ${c.email} ${c.id}`}
                      onSelect={() => {
                        setCustomerId(c.id);
                        setCustomerOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", customerId === c.id ? "opacity-100" : "opacity-0")} />
                      <div className="flex flex-col">
                        <span>{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input type="hidden" name="linkedUserId" value={customerId} />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="allowPix" checked={allowPix} onCheckedChange={setAllowPix} />
        <input type="hidden" name="allowPix" value={allowPix ? "on" : ""} />
        <div>
          <Label htmlFor="allowPix" className="cursor-pointer">Permitir PIX</Label>
          <p className="text-xs text-muted-foreground">Desligado = só cartão de crédito.</p>
        </div>
      </div>

      <div className="flex items-end md:col-span-2 lg:col-span-3">
        <Button type="submit" className="w-full md:w-auto" disabled={!selectedPlan}>
          <Plus className="h-4 w-4 mr-2" />
          Gerar Link de Pagamento
        </Button>
      </div>
    </form>
  );
}
