"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Customer {
  id: string;
  name: string;
  email: string;
}

/**
 * Seletor de cliente do link. Vincular tem consequência (a cobrança nasce na
 * conta do cliente), então escolher alguém passa por uma confirmação — escolher
 * "Genérico" não.
 */
export function CustomerCombobox({
  customers,
  value,
  onChange,
  disabled,
}: {
  customers: Customer[];
  /** id do cliente ou "none" para link genérico */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Customer | null>(null);

  const selected = customers.find(c => c.id === value);

  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="h-10 w-full justify-between font-normal"
            disabled={disabled}
            role="combobox"
            type="button"
            variant="outline"
          >
            {value !== "none" && selected ? (
              <span className="truncate">
                {selected.name} ({selected.email})
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
                    onChange("none");
                    setOpen(false);
                  }}
                  value="none genérico qualquer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "none" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Genérico — qualquer pessoa pode pagar
                </CommandItem>
                {customers.map(c => (
                  <CommandItem
                    key={c.id}
                    onSelect={() => {
                      setOpen(false);
                      if (c.id === value) return;
                      setPending(c);
                    }}
                    value={`${c.name} ${c.email} ${c.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === c.id ? "opacity-100" : "opacity-0"
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

      <AlertDialog
        onOpenChange={o => {
          if (!o) setPending(null);
        }}
        open={pending !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vincular o link a este cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              A fatura e o serviço vão para a conta de{" "}
              <strong>{pending?.name}</strong>. Não sabe quem vai pagar? Deixe{" "}
              <strong>Genérico</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pending) onChange(pending.id);
                setPending(null);
              }}
            >
              Vincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
