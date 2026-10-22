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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function CreateVoucherForm({
  users,
  createAction,
}: {
  users: User[];
  createAction: (formData: FormData) => Promise<void>;
}) {
  const [discountType, setDiscountType] = useState("fixed");
  const [userId, setUserId] = useState("");
  const [open, setOpen] = useState(false);

  const selectedUser = users.find(u => u.id === userId);

  return (
    <form
      action={createAction}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <div className="space-y-2">
        <Label htmlFor="code">Código do Voucher *</Label>
        <Input
          id="code"
          name="code"
          onChange={e => {
            e.target.value = e.target.value.replace(/\s/g, "").toUpperCase();
          }}
          placeholder="EX: ATLAS10"
          required
          type="text"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountType">Tipo de Desconto *</Label>
        <input name="discountType" type="hidden" value={discountType} />
        <Select onValueChange={setDiscountType} value={discountType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountValue">Valor do Desconto *</Label>
        <Input
          id="discountValue"
          min="0.01"
          name="discountValue"
          placeholder={discountType === "fixed" ? "Ex: 20.00" : "Ex: 10"}
          required
          step="0.01"
          type="number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userId">Vincular a Usuário (opcional)</Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              className="h-10 w-full justify-between font-normal"
              role="combobox"
              variant="outline"
            >
              {userId && userId !== "none" ? (
                <span className="truncate">
                  {selectedUser?.name} ({selectedUser?.email})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Nenhum (disponível para todos)
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
              <CommandInput placeholder="Buscar usuário..." />
              <CommandList>
                <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setUserId("none");
                      setOpen(false);
                    }}
                    value="none"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        userId === "none" || !userId
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    Disponível para todos
                  </CommandItem>
                  {users.map(u => (
                    <CommandItem
                      key={u.id}
                      onSelect={() => {
                        setUserId(u.id);
                        setOpen(false);
                      }}
                      value={`${u.name} ${u.email} ${u.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          userId === u.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {u.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input name="userId" type="hidden" value={userId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUses">Máx. de Usos</Label>
        <Input
          defaultValue={1}
          id="maxUses"
          min="1"
          name="maxUses"
          type="number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Data de Expiração (opcional)</Label>
        <Input id="expiresAt" name="expiresAt" type="date" />
      </div>

      <div className="flex items-end md:col-span-2 lg:col-span-3">
        <Button className="w-full md:w-auto" type="submit">
          <Plus className="mr-2 h-4 w-4" />
          Criar Voucher
        </Button>
      </div>
    </form>
  );
}
