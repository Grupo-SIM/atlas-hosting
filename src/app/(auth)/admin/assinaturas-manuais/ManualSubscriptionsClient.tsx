"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState, useTransition } from "react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  createManualSubscriptionAction,
  deleteManualSubscriptionAction,
  type ManualPaymentMethod,
  type ManualSubscriptionRow,
} from "./actions";

const PAYMENT_LABEL: Record<string, string> = {
  boleto: "Boleto",
  credit_card: "Cartão",
  other: "Outro",
  pix: "PIX",
};

const EMPTY_FORM = {
  /** Só dígitos, em centavos: digitar 8990 vira R$ 89,90. */
  amountCents: "",
  clientName: "",
  email: "",
  endDate: "",
  paymentMethod: "pix" as ManualPaymentMethod,
  phone: "",
  startDate: "",
};

function isExpired(subscription: ManualSubscriptionRow) {
  return subscription.endDate.getTime() < Date.now();
}

function formatBrl(value: number) {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function ManualSubscriptionsClient({
  subscriptions,
}: {
  subscriptions: ManualSubscriptionRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [onlyExpired, setOnlyExpired] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, startSaving] = useTransition();
  const [isRefreshing, startRefreshing] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const searchId = useId();
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const startDateId = useId();
  const endDateId = useId();
  const paymentMethodId = useId();
  const amountId = useId();

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return subscriptions.filter(s => {
      if (onlyExpired && !isExpired(s)) return false;
      if (!term) return true;
      return [s.clientName, s.email, s.phone]
        .filter(Boolean)
        .some(value => (value as string).toLowerCase().includes(term));
    });
  }, [subscriptions, search, onlyExpired]);

  const amountValue = form.amountCents ? Number(form.amountCents) / 100 : 0;

  const handleSave = () => {
    startSaving(async () => {
      const result = await createManualSubscriptionAction({
        amountBrl: amountValue > 0 ? amountValue.toFixed(2) : "",
        clientName: form.clientName,
        email: form.email,
        endDate: form.endDate,
        paymentMethod: form.paymentMethod,
        phone: form.phone,
        startDate: form.startDate,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Assinatura adicionada.");
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startSaving(async () => {
      const result = await deleteManualSubscriptionAction(id);
      setDeletingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Assinatura removida.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={searchId}>Buscar</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                id={searchId}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nome, email ou telefone..."
                value={search}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="gap-2"
              onClick={() => setOnlyExpired(v => !v)}
              type="button"
              variant={onlyExpired ? "default" : "outline"}
            >
              <AlertCircle className="h-4 w-4" />
              Apenas Expiradas
            </Button>

            <Button
              className="gap-2"
              disabled={isRefreshing}
              onClick={() => startRefreshing(() => router.refresh())}
              type="button"
              variant="ghost"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing && "animate-spin")}
              />
              Atualizar
            </Button>

            <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Assinatura</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={nameId}>Nome do Cliente</Label>
                    <Input
                      id={nameId}
                      onChange={e =>
                        setForm(f => ({ ...f, clientName: e.target.value }))
                      }
                      value={form.clientName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={phoneId}>Telefone</Label>
                    <IMaskInput
                      className={inputClasses}
                      id={phoneId}
                      inputMode="tel"
                      mask="(00) 00000-0000"
                      onAccept={value =>
                        setForm(f => ({ ...f, phone: String(value) }))
                      }
                      placeholder="(11) 98765-4321"
                      value={form.phone}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={emailId}>Email</Label>
                    <Input
                      id={emailId}
                      onChange={e =>
                        setForm(f => ({ ...f, email: e.target.value }))
                      }
                      type="email"
                      value={form.email}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={paymentMethodId}>
                        Método de Pagamento
                      </Label>
                      <Select
                        onValueChange={value =>
                          setForm(f => ({
                            ...f,
                            paymentMethod: value as ManualPaymentMethod,
                          }))
                        }
                        value={form.paymentMethod}
                      >
                        <SelectTrigger id={paymentMethodId}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="credit_card">Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={amountId}>Valor (R$) — opcional</Label>
                      <Input
                        id={amountId}
                        inputMode="numeric"
                        onChange={e => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 9);
                          setForm(f => ({
                            ...f,
                            amountCents: digits.replace(/^0+(?=\d)/, ""),
                          }));
                        }}
                        placeholder="Ex: 89,90"
                        value={form.amountCents ? formatBrl(amountValue) : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={startDateId}>Data de Início</Label>
                    <Input
                      id={startDateId}
                      onChange={e =>
                        setForm(f => ({ ...f, startDate: e.target.value }))
                      }
                      type="date"
                      value={form.startDate}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={endDateId}>Data de Término</Label>
                    <Input
                      id={endDateId}
                      onChange={e =>
                        setForm(f => ({ ...f, endDate: e.target.value }))
                      }
                      type="date"
                      value={form.endDate}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    disabled={isSaving}
                    onClick={() => setDialogOpen(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button disabled={isSaving} onClick={handleSave}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Assinaturas ({visible.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-8 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      {subscriptions.length === 0
                        ? "Nenhuma assinatura manual cadastrada."
                        : "Nenhuma assinatura encontrada com esses filtros."}
                    </TableCell>
                  </TableRow>
                )}
                {visible.map(subscription => {
                  const expired = isExpired(subscription);
                  return (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {subscription.clientName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {subscription.email && (
                            <span className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {subscription.email}
                            </span>
                          )}
                          {subscription.phone && (
                            <span className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {subscription.phone}
                            </span>
                          )}
                          {!(subscription.email || subscription.phone) && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>
                            {format(subscription.startDate, "dd/MM/yyyy")} -{" "}
                            {format(subscription.endDate, "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <CreditCard className="h-3 w-3" />
                            {PAYMENT_LABEL[subscription.paymentMethod] ??
                              subscription.paymentMethod}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscription.amountBrl === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          `R$ ${formatBrl(subscription.amountBrl)}`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={expired ? "destructive" : "default"}>
                          {expired ? "Expirada" : "Ativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="text-muted-foreground hover:text-destructive"
                              disabled={deletingId === subscription.id}
                              size="icon"
                              variant="ghost"
                            >
                              {deletingId === subscription.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir esta assinatura?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                O registro de{" "}
                                <strong>{subscription.clientName}</strong> some
                                da lista. Não dá pra desfazer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={e => {
                                  e.preventDefault();
                                  handleDelete(subscription.id);
                                }}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
