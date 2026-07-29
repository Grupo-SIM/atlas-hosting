"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SellablePlan } from "@/lib/vps-sellable-plans";

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  "storage-vps": "Storage VPS",
  vds: "VDS",
  vps: "Cloud VPS",
  "vps-windows": "VPS Windows",
};

interface Customer {
  id: string;
  name: string;
  email: string;
}

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
  const [allowBoleto, setAllowBoleto] = useState(false);

  const selectedPlan = plans.find(
    p => `${p.productType}:${p.planId}` === planKey
  );
  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <form
      action={createAction}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <input
        name="productType"
        type="hidden"
        value={selectedPlan?.productType || ""}
      />
      <input name="planId" type="hidden" value={selectedPlan?.planId || ""} />

      <div className="space-y-2">
        <Label>Produto / Plano *</Label>
        <Popover onOpenChange={setPlanOpen} open={planOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={planOpen}
              className="h-10 w-full justify-between font-normal"
              role="combobox"
              type="button"
              variant="outline"
            >
              {selectedPlan ? (
                <span className="truncate">
                  {PRODUCT_TYPE_LABEL[selectedPlan.productType]} —{" "}
                  {selectedPlan.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Buscar plano...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
          >
            <Command>
              <CommandInput placeholder="Buscar produto ou plano..." />
              <CommandList>
                <CommandEmpty>Nenhum plano encontrado.</CommandEmpty>
                <CommandGroup>
                  {plans.map(p => {
                    const key = `${p.productType}:${p.planId}`;
                    return (
                      <CommandItem
                        key={key}
                        onSelect={() => {
                          setPlanKey(key);
                          setPlanOpen(false);
                        }}
                        value={`${PRODUCT_TYPE_LABEL[p.productType]} ${p.name}`}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            planKey === key ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {PRODUCT_TYPE_LABEL[p.productType]}
                          </span>
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
          id="intervalMonths"
          min="1"
          name="intervalMonths"
          placeholder="Ex: 3"
          required
          step="1"
          type="number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amountBrl">Valor por ciclo (R$) *</Label>
        <Input
          id="amountBrl"
          min="0.01"
          name="amountBrl"
          placeholder="Ex: 89.90"
          required
          step="0.01"
          type="number"
        />
      </div>

      <div className="space-y-2 md:col-span-2 lg:col-span-2">
        <Label>Vincular a cliente (opcional)</Label>
        <Popover onOpenChange={setCustomerOpen} open={customerOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={customerOpen}
              className="h-10 w-full justify-between font-normal"
              role="combobox"
              type="button"
              variant="outline"
            >
              {customerId !== "none" && selectedCustomer ? (
                <span className="truncate">
                  {selectedCustomer.name} ({selectedCustomer.email})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Genérico — qualquer pessoa pode pagar
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
          >
            <Command>
              <CommandInput placeholder="Buscar cliente..." />
              <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setCustomerId("none");
                      setCustomerOpen(false);
                    }}
                    value="none genérico qualquer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        customerId === "none" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Genérico — qualquer pessoa pode pagar
                  </CommandItem>
                  {customers.map(c => (
                    <CommandItem
                      key={c.id}
                      onSelect={() => {
                        setCustomerId(c.id);
                        setCustomerOpen(false);
                      }}
                      value={`${c.name} ${c.email} ${c.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          customerId === c.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{c.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {c.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input name="linkedUserId" type="hidden" value={customerId} />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={allowPix}
          id="allowPix"
          onCheckedChange={setAllowPix}
        />
        <input name="allowPix" type="hidden" value={allowPix ? "on" : ""} />
        <div>
          <Label className="cursor-pointer" htmlFor="allowPix">
            Permitir PIX
          </Label>
          <p className="text-muted-foreground text-xs">
            Desligado = só cartão de crédito.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={allowBoleto}
          id="allowBoleto"
          onCheckedChange={setAllowBoleto}
        />
        <input
          name="allowBoleto"
          type="hidden"
          value={allowBoleto ? "on" : ""}
        />
        <div>
          <Label className="cursor-pointer" htmlFor="allowBoleto">
            Permitir Boleto
          </Label>
          <p className="text-muted-foreground text-xs">
            Desligado = boleto indisponível neste link.
          </p>
        </div>
      </div>

      <div className="flex items-end md:col-span-2 lg:col-span-3">
        <Button
          className="w-full md:w-auto"
          disabled={!selectedPlan}
          type="submit"
        >
          <Plus className="mr-2 h-4 w-4" />
          Gerar Link de Pagamento
        </Button>
      </div>
    </form>
  );
}
