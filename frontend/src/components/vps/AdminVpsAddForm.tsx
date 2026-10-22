"use client";

import { format } from "date-fns";
import { Check, ChevronsUpDown, Loader2, Server } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  getVpsSubscriptionsForUserAction,
  registerVpsAction,
} from "@/app/vps-actions";
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
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface VpsSubscription {
  id: string;
  planId: string;
  planType: string;
  createdAt: Date;
  status: string;
  vpsNodeId: string | null;
}

interface AdminVpsAddFormProps {
  users: User[];
}

const subscriptionLabel = (subscription: VpsSubscription) =>
  `${format(subscription.createdAt, "yyyy/M/d @ HH:mm")} (${subscription.id})`;

export default function AdminVpsAddForm({ users }: AdminVpsAddFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [vpsSubscriptionId, setVpsSubscriptionId] = useState("");
  const [subscriptions, setSubscriptions] = useState<VpsSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  // Um estado por combobox. Compartilhar um só faz os dois Popover montarem
  // juntos, e o auto-focus do segundo conta como "focus outside" pro primeiro,
  // que dispara onOpenChange(false) e fecha os dois no mesmo instante.
  const [userOpen, setUserOpen] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (!userId) {
      toast.error("Por favor, selecione um usuário.");
      return;
    }

    setLoading(true);
    const name = formData.get("name") as string;
    const ip = formData.get("ip") as string;

    try {
      await registerVpsAction(
        userId,
        name,
        ip,
        "Ubuntu 22.04 LTS",
        vpsSubscriptionId || undefined
      );
      toast.success("Servidor registrado com sucesso!");
      router.refresh(); // Atualiza a lista de servidores

      // Limpar campos de texto
      (document.getElementById("vps-form") as HTMLFormElement)?.reset();
      setUserId("");
      setVpsSubscriptionId("");
      setSubscriptions([]);
    } catch (error: any) {
      toast.error(`Erro ao registrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find(u => u.id === userId);
  const availableSubscriptions = subscriptions.filter(
    subscription => !subscription.vpsNodeId
  );
  const selectedSubscription = availableSubscriptions.find(
    subscription => subscription.id === vpsSubscriptionId
  );

  async function selectUser(nextUserId: string) {
    setUserId(nextUserId);
    setVpsSubscriptionId("");
    setSubscriptions([]);
    setUserOpen(false);
    setLoadingSubscriptions(true);

    try {
      setSubscriptions(await getVpsSubscriptionsForUserAction(nextUserId));
    } catch (error: any) {
      toast.error(`Erro ao carregar assinaturas: ${error.message}`);
    } finally {
      setLoadingSubscriptions(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4" id="vps-form">
      <div className="space-y-2">
        <Label htmlFor="user-select">Usuário Destino</Label>
        <Popover onOpenChange={setUserOpen} open={userOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={userOpen}
              className="h-10 w-full justify-between font-normal"
              id="user-select"
              role="combobox"
              variant="outline"
            >
              {userId ? (
                <span className="truncate">
                  {selectedUser?.name || "Sem Nome"} ({selectedUser?.email})
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Selecione um cliente...
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
                  {users.map(u => (
                    <CommandItem
                      key={u.id}
                      onSelect={() => selectUser(u.id)}
                      value={`${u.name} ${u.email} ${u.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          userId === u.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{u.name || "Sem Nome"}</span>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="vps-subscriptions">
          Assinatura <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Popover onOpenChange={setSubscriptionOpen} open={subscriptionOpen}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={subscriptionOpen}
              className="h-10 w-full justify-between font-normal"
              id="vps-subscriptions"
              role="combobox"
              variant="outline"
            >
              {selectedSubscription ? (
                <span className="truncate">
                  {subscriptionLabel(selectedSubscription)}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {loadingSubscriptions
                    ? "Carregando assinaturas..."
                    : "Selecione uma assinatura..."}
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
              <CommandInput placeholder="Buscar assinaturas..." />
              <CommandList>
                <CommandEmpty>
                  {userId
                    ? "Nenhuma assinatura encontrada."
                    : "Selecione um cliente primeiro."}
                </CommandEmpty>
                <CommandGroup>
                  {availableSubscriptions.map(subscription => (
                    <CommandItem
                      key={subscription.id}
                      onSelect={() => {
                        setVpsSubscriptionId(subscription.id);
                        setSubscriptionOpen(false);
                      }}
                      value={`${subscriptionLabel(subscription)} ${subscription.id}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          vpsSubscriptionId === subscription.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{subscriptionLabel(subscription)}</span>
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
        <Input
          disabled={loading}
          id="name"
          name="name"
          placeholder="Ex: VPS Premium #01"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ip">Endereço IP</Label>
        <Input
          disabled={loading}
          id="ip"
          name="ip"
          placeholder="0.0.0.0"
          required
        />
      </div>

      <Button className="w-full gap-2" disabled={loading} type="submit">
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
