"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useState } from "react";
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

  const selectedUser = users.find((u) => u.id === userId);

  return (
    <form action={createAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="code">Código do Voucher *</Label>
        <Input
          name="code"
          id="code"
          type="text"
          required
          placeholder="EX: ATLAS10"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\s/g, "").toUpperCase();
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountType">Tipo de Desconto *</Label>
        <input type="hidden" name="discountType" value={discountType} />
        <Select value={discountType} onValueChange={setDiscountType}>
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
          name="discountValue"
          id="discountValue"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder={discountType === "fixed" ? "Ex: 20.00" : "Ex: 10"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userId">Vincular a Usuário (opcional)</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full h-10 justify-between font-normal"
            >
              {userId && userId !== "none" ? (
                <span className="truncate">
                  {selectedUser?.name} ({selectedUser?.email})
                </span>
              ) : (
                <span className="text-muted-foreground">Nenhum (disponível para todos)</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar usuário..." />
              <CommandList>
                <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="none"
                    onSelect={() => {
                      setUserId("none");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        userId === "none" || !userId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Disponível para todos
                  </CommandItem>
                  {users.map((u) => (
                    <CommandItem
                      key={u.id}
                      value={`${u.name} ${u.email} ${u.id}`}
                      onSelect={() => {
                        setUserId(u.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          userId === u.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <input type="hidden" name="userId" value={userId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxUses">Máx. de Usos</Label>
        <Input
          name="maxUses"
          id="maxUses"
          type="number"
          min="1"
          defaultValue={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiresAt">Data de Expiração (opcional)</Label>
        <Input
          name="expiresAt"
          id="expiresAt"
          type="date"
        />
      </div>

      <div className="flex items-end md:col-span-2 lg:col-span-3">
        <Button type="submit" className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Criar Voucher
        </Button>
      </div>
    </form>
  );
}
