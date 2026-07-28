"use client";

import { Check, ChevronsUpDown, Users, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface InvoiceClientOption {
  id: string;
  name: string;
  email: string;
}

export function InvoiceClientFilter({
  clients,
}: {
  clients: InvoiceClientOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const selectedClientId = searchParams.get("clientId") || "";
  const selected = clients.find(c => c.id === selectedClientId) || null;

  function goToClient(clientId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (clientId) {
      params.set("clientId", clientId);
    } else {
      params.delete("clientId");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className="w-72 justify-between"
            role="combobox"
            variant="outline"
          >
            <span className="flex items-center gap-2 truncate">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              {selected ? (
                <span className="truncate">{selected.name}</span>
              ) : (
                <span className="text-muted-foreground">
                  Filtrar por cliente...
                </span>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0">
          <Command>
            <CommandInput placeholder="Buscar cliente..." />
            <CommandList>
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup>
                {clients.map(client => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => goToClient(client.id)}
                    value={`${client.name} ${client.email}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        client.id === selectedClientId
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col truncate">
                      <span className="truncate text-sm">{client.name}</span>
                      <span className="truncate text-muted-foreground text-xs">
                        {client.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          className="gap-1"
          onClick={() => goToClient(null)}
          size="sm"
          variant="ghost"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
