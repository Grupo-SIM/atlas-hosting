"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SimpayCalendar } from "./simpay-calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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

export interface ReferralRow {
  id: string;
  email: string | null;
  createdAt: Date;
}

interface AffiliateTabsProps {
  affiliateLink: string;
  availableBalance: number;
  pendingWithdrawals: number;
  totalEarnedAllTime: number;
  referrals: ReferralRow[];
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
      label: "Saque efetuado",
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

const ITEMS_PER_PAGE = 10;

function LocalPagination({ 
  currentPage, 
  totalItems, 
  onPageChange 
}: { 
  currentPage: number; 
  totalItems: number; 
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
      <p className="text-xs text-muted-foreground font-medium">
        Mostrando {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)} a {Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} de {totalItems}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 text-xs font-bold"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 text-xs font-bold"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}

export function AffiliateTabs({
  affiliateLink,
  availableBalance,
  pendingWithdrawals,
  totalEarnedAllTime,
  referrals,
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

  // Filters
  const [salesStatus, setSalesStatus] = useState<string>("all");
  const [withdrawalStatus, setWithdrawalStatus] = useState<string>("all");
  const [salesStartDate, setSalesStartDate] = useState<Date | null>(null);
  const [salesEndDate, setSalesEndDate] = useState<Date | null>(null);
  const [withdrawalStartDate, setWithdrawalStartDate] = useState<Date | null>(null);
  const [withdrawalEndDate, setWithdrawalEndDate] = useState<Date | null>(null);
  const [referralStartDate, setReferralStartDate] = useState<Date | null>(null);
  const [referralEndDate, setReferralEndDate] = useState<Date | null>(null);

  // Pagination states
  const [referralsPage, setReferralsPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);

  // Reset pagination on filter change
  useEffect(() => { setReferralsPage(1); }, [referrals.length, referralStartDate, referralEndDate]);
  useEffect(() => { setSalesPage(1); }, [salesStatus, salesStartDate, salesEndDate]);
  useEffect(() => { setWithdrawalsPage(1); }, [withdrawalStatus, withdrawalStartDate, withdrawalEndDate]);

  const filteredCommissions = commissions.filter((c) => {
    const statusMatch = salesStatus === "all" || c.status === salesStatus;
    const date = new Date(c.createdAt);
    
    let startMatch = true;
    if (salesStartDate) {
      const start = new Date(salesStartDate);
      start.setHours(0, 0, 0, 0);
      startMatch = date >= start;
    }

    let endMatch = true;
    if (salesEndDate) {
      const end = new Date(salesEndDate);
      end.setHours(23, 59, 59, 999);
      endMatch = date <= end;
    }

    return statusMatch && startMatch && endMatch;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    const statusMatch = withdrawalStatus === "all" || w.status === withdrawalStatus;
    if (!w.createdAt) return statusMatch;
    
    const date = new Date(w.createdAt);
    
    let startMatch = true;
    if (withdrawalStartDate) {
      const start = new Date(withdrawalStartDate);
      start.setHours(0, 0, 0, 0);
      startMatch = date >= start;
    }

    let endMatch = true;
    if (withdrawalEndDate) {
      const end = new Date(withdrawalEndDate);
      end.setHours(23, 59, 59, 999);
      endMatch = date <= end;
    }

    return statusMatch && startMatch && endMatch;
  });

  const filteredReferrals = referrals.filter((r) => {
    const date = new Date(r.createdAt);
    
    let startMatch = true;
    if (referralStartDate) {
      const start = new Date(referralStartDate);
      start.setHours(0, 0, 0, 0);
      startMatch = date >= start;
    }

    let endMatch = true;
    if (referralEndDate) {
      const end = new Date(referralEndDate);
      end.setHours(23, 59, 59, 999);
      endMatch = date <= end;
    }

    return startMatch && endMatch;
  });

  // Paged data
  const pagedReferrals = filteredReferrals.slice(
    (referralsPage - 1) * ITEMS_PER_PAGE,
    referralsPage * ITEMS_PER_PAGE
  );
  const pagedCommissions = filteredCommissions.slice(
    (salesPage - 1) * ITEMS_PER_PAGE,
    salesPage * ITEMS_PER_PAGE
  );
  const pagedWithdrawals = filteredWithdrawals.slice(
    (withdrawalsPage - 1) * ITEMS_PER_PAGE,
    withdrawalsPage * ITEMS_PER_PAGE
  );

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
        <DialogContent className="sm:max-w-[425px] border-rose-500/30 dark:bg-[#020817] bg-white shadow-2xl dark:shadow-rose-500/10 shadow-rose-200/20">
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
            <div className="p-5 rounded-2xl dark:bg-rose-500/5 bg-rose-50/50 border border-rose-500/20 backdrop-blur-md shadow-inner">
              <p className="text-[15px] leading-relaxed dark:text-white text-rose-950 font-medium">
                {rejectionReasonModal}
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
                <div className="text-2xl font-bold">{referrals.length}</div>
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

          {/* Referred Users List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Usuários Indicados</CardTitle>
                <CardDescription>
                  Pessoas que se cadastraram através do seu link
                </CardDescription>
              </div>
              <div className="w-[240px]">
                <SimpayCalendar 
                  label="Período"
                  start={referralStartDate}
                  end={referralEndDate}
                  onChange={(start, end) => {
                    setReferralStartDate(start);
                    setReferralEndDate(end);
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredReferrals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  {referralStartDate || referralEndDate ? "Nenhuma indicação encontrada neste período." : "Nenhuma indicação registrada ainda."}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data de Cadastro</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedReferrals.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          {format(new Date(r.createdAt), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {r.email ? (
                            <span>
                              {r.email.split('@')[0].slice(0, 3)}***@{r.email.split('@')[1]}
                            </span>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <LocalPagination 
                currentPage={referralsPage} 
                totalItems={filteredReferrals.length} 
                onPageChange={setReferralsPage} 
              />
            </CardContent>
          </Card>

          {/* Sales History integrated into Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>
                  Compras recentes realizadas através do seu link de afiliado
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-[240px]">
                  <SimpayCalendar 
                    label="Período"
                    start={salesStartDate}
                    end={salesEndDate}
                    onChange={(start, end) => {
                      setSalesStartDate(start);
                      setSalesEndDate(end);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Status</span>
                  <Select value={salesStatus} onValueChange={setSalesStatus}>
                    <SelectTrigger className="w-[140px] h-10 text-sm bg-transparent border-slate-200 dark:border-slate-800 font-bold">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>

                      <SelectItem value="withdrawn">Saque efetuado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCommissions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  {salesStatus === "all" ? "Nenhuma venda registrada ainda." : "Nenhuma venda encontrada com este status."}
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
                    {pagedCommissions.map((c) => (
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
              <LocalPagination 
                currentPage={salesPage} 
                totalItems={filteredCommissions.length} 
                onPageChange={setSalesPage} 
              />
            </CardContent>
          </Card>
        </div>
      )}



      {/* Withdrawals */}
      {tab === "withdrawals" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Histórico de Saques</CardTitle>
              <CardDescription>
                Mínimo {toBrl(minWithdrawal)} · Taxa {toBrl(fee)}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="w-[240px]">
                  <SimpayCalendar 
                    label="Período"
                    start={withdrawalStartDate}
                    end={withdrawalEndDate}
                    onChange={(start, end) => {
                      setWithdrawalStartDate(start);
                      setWithdrawalEndDate(end);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Status</span>
                  <Select value={withdrawalStatus} onValueChange={setWithdrawalStatus}>
                    <SelectTrigger className="w-[140px] h-10 text-sm bg-transparent border-slate-200 dark:border-slate-800 font-bold">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              disabled={availableBalance < minWithdrawal}
            >
              Solicitar Saque
            </Button>
          </CardHeader>
          <CardContent>
            {filteredWithdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                {withdrawalStatus === "all" ? "Nenhum saque realizado ainda." : "Nenhum saque encontrado com este status."}
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
                  {pagedWithdrawals.map((w) => {
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
            <LocalPagination 
              currentPage={withdrawalsPage} 
              totalItems={filteredWithdrawals.length} 
              onPageChange={setWithdrawalsPage} 
            />
          </CardContent>
        </Card>
      )}
    </TooltipProvider>
  );
}
