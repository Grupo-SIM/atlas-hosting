"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WithdrawalModal } from "./WithdrawalModal";
import AffiliateLinkDisplay from "./AffiliateLinkDisplay";
import { toBrl } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cancelLocalWithdrawal, syncWithdrawalStatus } from "../actions";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Info, 
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export interface CommissionRow {
  id: string;
  grossAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: string;
  createdAt: Date;
}

export interface WithdrawalRow {
  id: string;
  amount: number;
  fee: number | null;
  status: string;
  rejectionReason: string | null;
  simpayWithdrawalId: string | null;
  createdAt: Date | null;
}

interface AffiliateTabsProps {
  affiliateLink: string;
  availableBalance: number;
  pendingWithdrawals: number;
  totalEarnedAllTime: number;
  totalReferrals: number;
  commissions: CommissionRow[];
  withdrawals: WithdrawalRow[];
  minWithdrawal: number;
  fee: number;
}

function statusBadge(status: string) {
  const configs: Record<string, { label: string; icon: any; className: string }> = {
    available: {
      label: "Disponível",
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 backdrop-blur-md shadow-sm shadow-emerald-500/5",
    },
    withdrawn: {
      label: "Sacado",
      icon: ArrowUpRight,
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 backdrop-blur-md shadow-sm shadow-blue-500/5",
    },
    pending: {
      label: "Pendente",
      icon: Clock,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 backdrop-blur-md shadow-sm shadow-amber-500/5",
    },
    approved: {
      label: "Aprovado",
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 backdrop-blur-md shadow-sm shadow-emerald-500/5",
    },
    rejected: {
      label: "Rejeitado",
      icon: XCircle,
      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 backdrop-blur-md shadow-sm shadow-rose-500/5",
    },
  };

  const config = configs[status] || {
    label: status,
    icon: Info,
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 backdrop-blur-md",
  };

  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full transition-all duration-300 hover:bg-opacity-20", 
        config.className
      )}
    >
      <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
      {config.label}
    </Badge>
  );
}

export function AffiliateTabs({
  affiliateLink,
  availableBalance,
  pendingWithdrawals,
  totalEarnedAllTime,
  totalReferrals,
  commissions,
  withdrawals,
  minWithdrawal,
  fee,
}: AffiliateTabsProps) {
  const [tab, setTab] = useState<"overview" | "sales" | "withdrawals">("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectionReasonModal, setRejectionReasonModal] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync(withdrawalId: string) {
    setSyncing(withdrawalId);
    await syncWithdrawalStatus(withdrawalId);
    router.refresh();
    setSyncing(null);
  }

  async function handleCancel(withdrawalId: string) {
    setCancelling(withdrawalId);
    await cancelLocalWithdrawal(withdrawalId);
    router.refresh();
    setCancelling(null);
  }

  const tabs = [
    { id: "overview" as const, label: "Visão Geral" },
    { id: "sales" as const, label: "Vendas" },
    { id: "withdrawals" as const, label: "Saques" },
  ];

  return (
    <TooltipProvider>
      <WithdrawalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        availableBalance={availableBalance}
        minWithdrawal={minWithdrawal}
        fee={fee}
      />

      <Dialog open={!!rejectionReasonModal} onOpenChange={(open) => !open && setRejectionReasonModal(null)}>
        <DialogContent className="sm:max-w-[425px] border-rose-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" />
              Saque Rejeitado
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500/70 mb-3">
              Motivo da Rejeição
            </p>
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100/50 backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-rose-900/80 dark:text-rose-100 font-medium italic">
                "{rejectionReasonModal}"
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tab nav */}
      <div className="flex gap-1 border-b pb-0 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {toBrl(availableBalance)}
                </div>
                {pendingWithdrawals > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {toBrl(pendingWithdrawals)} em processamento
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{toBrl(totalEarnedAllTime)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Indicações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReferrals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{commissions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seu Link de Afiliado</CardTitle>
              <CardDescription>
                Compartilhe e ganhe comissões em cada compra
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <AffiliateLinkDisplay affiliateLink={affiliateLink} />
              {availableBalance >= minWithdrawal && (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Solicitar Saque
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales */}
      {tab === "sales" && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>
              Compras realizadas através do seu link de afiliado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor da compra</TableHead>
                    <TableHead>Sua comissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        {format(new Date(c.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>{toBrl(c.grossAmount)}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {toBrl(c.commissionAmount)}
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Withdrawals */}
      {tab === "withdrawals" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Histórico de Saques</CardTitle>
              <CardDescription>
                Mínimo {toBrl(minWithdrawal)} · Taxa {toBrl(fee)}
              </CardDescription>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              disabled={availableBalance < minWithdrawal}
            >
              Solicitar Saque
            </Button>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum saque realizado ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Bruto</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Líquido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => {
                    const feeAmt = w.fee ?? fee;
                    const net = w.amount - feeAmt;
                    return (
                      <TableRow key={w.id}>
                        <TableCell>
                          {w.createdAt
                            ? format(new Date(w.createdAt), "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "—"}
                        </TableCell>
                        <TableCell>{toBrl(w.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          - {toBrl(feeAmt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {toBrl(net)}
                        </TableCell>
                        <TableCell>
                          {statusBadge(w.status)}
                          {w.status === "rejected" && w.rejectionReason && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  onClick={() => setRejectionReasonModal(w.rejectionReason)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Clique para mais informações</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>
                          {w.status === "pending" && w.simpayWithdrawalId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSync(w.id)}
                              disabled={syncing === w.id}
                            >
                              {syncing === w.id ? "Verificando..." : "Atualizar"}
                            </Button>
                          )}
                          {w.status === "pending" && !w.simpayWithdrawalId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(w.id)}
                              disabled={cancelling === w.id}
                            >
                              {cancelling === w.id ? "Cancelando..." : "Cancelar"}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </TooltipProvider>
  );
}
