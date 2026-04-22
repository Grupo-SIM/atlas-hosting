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
import { Plus } from "lucide-react";
import { useState } from "react";

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
        <input type="hidden" name="userId" value={userId} />
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Nenhum (disponível para todos)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum (disponível para todos)</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
