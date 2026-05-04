"use client";

import { useState } from "react";
import { Server, Plus, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { registerVpsAction } from "@/app/vps-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);

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
      
      // Limpar campos de texto
      (document.getElementById("vps-form") as HTMLFormElement)?.reset();
      setUserId("");
    } catch (error: any) {
      toast.error("Erro ao registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find((u) => u.id === userId);

  return (
    <form id="vps-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-select">Usuário Destino</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full h-10 justify-between font-normal"
              id="user-select"
            >
              {userId ? (
                <span className="truncate">
                  {selectedUser?.name || "Sem Nome"} ({selectedUser?.email})
                </span>
              ) : (
                <span className="text-muted-foreground">Selecione um cliente...</span>
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
                        <span>{u.name || "Sem Nome"}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
