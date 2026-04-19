"use client";

import { useState } from "react";
import { Server, Plus, Loader2 } from "lucide-react";
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
import { registerVpsAction } from "@/app/vps-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface AdminVpsAddFormProps {
  users: User[];
}

export default function AdminVpsAddForm({ users }: AdminVpsAddFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    if (!userId) {
      toast.error("Por favor, selecione um usuário.");
      return;
    }

    setLoading(true);
    const name = formData.get("name") as string;
    const ip = formData.get("ip") as string;

    try {
      await registerVpsAction(userId, name, ip, "Ubuntu 22.04 LTS");
      toast.success("Servidor registrado com sucesso!");
      router.refresh(); // Atualiza a lista de servidores
      
      // Limpar campos de texto (o select a gente limpa via state)
      (document.getElementById("vps-form") as HTMLFormElement)?.reset();
      setUserId("");
    } catch (error: any) {
      toast.error("Erro ao registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="vps-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-select">Usuário Destino</Label>
        <Select value={userId} onValueChange={setUserId} required>
          <SelectTrigger id="user-select" className="w-full">
            <SelectValue placeholder="Selecione um cliente..." />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name || "Sem Nome"} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Servidor</Label>
        <Input name="name" id="name" placeholder="Ex: VPS Premium #01" required disabled={loading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ip">Endereço IP</Label>
        <Input name="ip" id="ip" placeholder="0.0.0.0" required disabled={loading} />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Server className="h-4 w-4" />
        )}
        {loading ? "Registrando..." : "Registrar e Gerar Token"}
      </Button>
    </form>
  );
}
