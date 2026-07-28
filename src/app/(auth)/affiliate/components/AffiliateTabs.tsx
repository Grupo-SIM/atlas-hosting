"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, CheckCircle2, Clock, Info, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, toBrl } from "@/lib/utils";
import { cancelLocalWithdrawal, syncWithdrawalStatus } from "../actions";
import AffiliateLinkDisplay from "./AffiliateLinkDisplay";
import { SimpayCalendar } from "./simpay-calendar";
import { WithdrawalModal } from "./WithdrawalModal";

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
  const configs: Record<
    string,
    { label: string; icon: any; className: string }
  > = {
    approved: {
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 backdrop-blur-md shadow-sm shadow-emerald-500/5",
      icon: CheckCircle2,
      label: "Aprovado",
    },
    available: {
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 backdrop-blur-md shadow-sm shadow-emerald-500/5",
      icon: CheckCircle2,
      label: "Disponível",
    },
    pending: {
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 backdrop-blur-md shadow-sm shadow-amber-500/5",
      icon: Clock,
      label: "Pendente",
    },
    rejected: {
      className:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 backdrop-blur-md shadow-sm shadow-rose-500/5",
      icon: XCircle,
      label: "Rejeitado",
    },
    withdrawn: {
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 backdrop-blur-md shadow-sm shadow-blue-500/5",
      icon: ArrowUpRight,
      label: "Saque efetuado",
    },
  };

  const config = configs[status] || {
    className:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 backdrop-blur-md",
    icon: Info,
    label: status,
  };

  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "pointer-events-none gap-1.5 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider transition-all duration-300",
        config.className
      )}
      variant="outline"
    >
      <Icon className="h-3.5 w-3.5 stroke-[2.5]" />
      {config.label}
    </Badge>
  );
}

const ITEMS_PER_PAGE = 10;

function LocalPagination({
  currentPage,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-slate-100 border-t pt-4 dark:border-slate-800">
      <p className="font-medium text-muted-foreground text-xs">
        Mostrando {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)}{" "}
        a {Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} de {totalItems}
      </p>
      <div className="flex gap-2">
        <Button
          className="h-8 font-bold text-xs"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
          variant="outline"
        >
          Anterior
        </Button>
        <Button
          className="h-8 font-bold text-xs"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
          variant="outline"
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
  const [tab, setTab] = useState<
    "overview" | "referrals" | "sales" | "withdrawals"
  >("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectionReasonModal, setRejectionReasonModal] = useState<
    string | null
  >(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState<string | null>(null);
  const router = useRouter();

  // Filters
  const [salesStatus, setSalesStatus] = useState<string>("all");
  const [withdrawalStatus, setWithdrawalStatus] = useState<string>("all");
  const [salesStartDate, setSalesStartDate] = useState<Date | null>(null);
  const [salesEndDate, setSalesEndDate] = useState<Date | null>(null);
  const [withdrawalStartDate, setWithdrawalStartDate] = useState<Date | null>(
    null
  );
  const [withdrawalEndDate, setWithdrawalEndDate] = useState<Date | null>(null);
  const [referralStartDate, setReferralStartDate] = useState<Date | null>(null);
  const [referralEndDate, setReferralEndDate] = useState<Date | null>(null);
  const [referralSearch, setReferralSearch] = useState("");

  // Pagination states
  const [referralsPage, setReferralsPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);

  // Reset pagination on filter change
  useEffect(() => {
    setReferralsPage(1);
  }, [referrals.length, referralStartDate, referralEndDate, referralSearch]);
  useEffect(() => {
    setSalesPage(1);
  }, [salesStatus, salesStartDate, salesEndDate]);
  useEffect(() => {
    setWithdrawalsPage(1);
  }, [withdrawalStatus, withdrawalStartDate, withdrawalEndDate]);

  const filteredCommissions = commissions.filter(c => {
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

  const filteredWithdrawals = withdrawals.filter(w => {
    const statusMatch =
      withdrawalStatus === "all" || w.status === withdrawalStatus;
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

  const filteredReferrals = referrals.filter(r => {
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

    let emailMatch = true;
    if (referralSearch && r.email) {
      emailMatch = r.email.toLowerCase().includes(referralSearch.toLowerCase());
    } else if (referralSearch && !r.email) {
      emailMatch = false;
    }

    return startMatch && endMatch && emailMatch;
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
    { id: "referrals" as const, label: "Indicações" },
    { id: "sales" as const, label: "Vendas" },
    { id: "withdrawals" as const, label: "Saques" },
  ];

  return (
    <TooltipProvider>
      <WithdrawalModal
        availableBalance={availableBalance}
        fee={fee}
        minWithdrawal={minWithdrawal}
        onClose={() => setModalOpen(false)}
        open={modalOpen}
      />

      <Dialog
        onOpenChange={open => !open && setRejectionReasonModal(null)}
        open={!!rejectionReasonModal}
      >
        <DialogContent className="border-rose-500/30 bg-white shadow-2xl shadow-rose-200/20 sm:max-w-[425px] dark:bg-[#020817] dark:shadow-rose-500/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" />
              Saque Rejeitado
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-3 font-bold text-[10px] text-rose-500/70 uppercase tracking-[0.2em]">
              Motivo da Rejeição
            </p>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-50/50 p-5 shadow-inner backdrop-blur-md dark:bg-rose-500/5">
              <p className="font-medium text-[15px] text-rose-950 leading-relaxed dark:text-white">
                {rejectionReasonModal}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tab nav */}
      <div className="mb-4 flex gap-1 border-b pb-0">
        {tabs.map(t => (
          <button
            className={`rounded-t border-b-2 px-4 py-2 font-medium text-sm transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            key={t.id}
            onClick={() => setTab(t.id)}
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
                <CardTitle className="font-medium text-sm">
                  Saldo Disponível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-green-600">
                  {toBrl(availableBalance)}
                </div>
                {pendingWithdrawals > 0 && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {toBrl(pendingWithdrawals)} em processamento
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Total Ganho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {toBrl(totalEarnedAllTime)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">
                  Indicações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{referrals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-medium text-sm">Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">{commissions.length}</div>
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
                  className="w-full sm:w-auto"
                  onClick={() => setModalOpen(true)}
                >
                  Solicitar Saque
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Referred Users Tab */}
      {tab === "referrals" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Usuários Indicados</CardTitle>
                <CardDescription>
                  Pessoas que se cadastraram através do seu link
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="ml-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                    E-mail
                  </span>
                  <Input
                    className="h-10 w-full border-slate-200 bg-transparent font-medium text-sm md:w-[200px] dark:border-slate-800"
                    onChange={e => setReferralSearch(e.target.value)}
                    placeholder="Pesquisar por email..."
                    value={referralSearch}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <SimpayCalendar
                    end={referralEndDate}
                    label="Período"
                    onChange={(start, end) => {
                      setReferralStartDate(start);
                      setReferralEndDate(end);
                    }}
                    start={referralStartDate}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReferrals.length === 0 ? (
                <p className="py-10 text-center text-muted-foreground text-sm">
                  {referralStartDate || referralEndDate
                    ? "Nenhuma indicação encontrada neste período."
                    : "Nenhuma indicação registrada ainda."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedReferrals.map(r => (
                        <TableRow key={r.id}>
                          <TableCell>
                            {format(new Date(r.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.email ? (
                              <span>
                                {r.email.split("@")[0].slice(0, 3)}***@
                                {r.email.split("@")[1]}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <LocalPagination
                currentPage={referralsPage}
                onPageChange={setReferralsPage}
                totalItems={filteredReferrals.length}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales Tab */}
      {tab === "sales" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>
                  Compras recentes realizadas através do seu link de afiliado
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-[240px]">
                  <SimpayCalendar
                    end={salesEndDate}
                    label="Período"
                    onChange={(start, end) => {
                      setSalesStartDate(start);
                      setSalesEndDate(end);
                    }}
                    start={salesStartDate}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="ml-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                    Status
                  </span>
                  <Select onValueChange={setSalesStatus} value={salesStatus}>
                    <SelectTrigger className="h-10 w-[140px] border-slate-200 bg-transparent font-bold text-sm dark:border-slate-800">
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
                <p className="py-10 text-center text-muted-foreground text-sm">
                  {salesStatus === "all"
                    ? "Nenhuma venda registrada ainda."
                    : "Nenhuma venda encontrada com este status."}
                </p>
              ) : (
                <div className="overflow-x-auto">
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
                      {pagedCommissions.map(c => (
                        <TableRow key={c.id}>
                          <TableCell>
                            {format(new Date(c.createdAt), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell>{toBrl(c.grossAmount)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {toBrl(c.commissionAmount)}
                          </TableCell>
                          <TableCell>{statusBadge(c.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <LocalPagination
                currentPage={salesPage}
                onPageChange={setSalesPage}
                totalItems={filteredCommissions.length}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdrawals */}
      {tab === "withdrawals" && (
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <CardTitle>Histórico de Saques</CardTitle>
                <CardDescription>
                  Mínimo {toBrl(minWithdrawal)} · Taxa {toBrl(fee)}
                </CardDescription>
              </div>
              <Button
                className="w-full shrink-0 md:w-auto"
                disabled={availableBalance < minWithdrawal}
                onClick={() => setModalOpen(true)}
              >
                Solicitar Saque
              </Button>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-[240px]">
                <SimpayCalendar
                  end={withdrawalEndDate}
                  label="Período"
                  onChange={(start, end) => {
                    setWithdrawalStartDate(start);
                    setWithdrawalEndDate(end);
                  }}
                  start={withdrawalStartDate}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="ml-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
                  Status
                </span>
                <Select
                  onValueChange={setWithdrawalStatus}
                  value={withdrawalStatus}
                >
                  <SelectTrigger className="h-10 w-[140px] border-slate-200 bg-transparent font-bold text-sm dark:border-slate-800">
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
          </CardHeader>
          <CardContent>
            {filteredWithdrawals.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground text-sm">
                {withdrawalStatus === "all"
                  ? "Nenhum saque realizado ainda."
                  : "Nenhum saque encontrado com este status."}
              </p>
            ) : (
              <div className="overflow-x-auto">
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
                    {pagedWithdrawals.map(w => {
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
                                    className="ml-2 h-8 w-8 text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                    onClick={() =>
                                      setRejectionReasonModal(w.rejectionReason)
                                    }
                                    size="icon"
                                    variant="ghost"
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
                                disabled={syncing === w.id}
                                onClick={() => handleSync(w.id)}
                                size="sm"
                                variant="ghost"
                              >
                                {syncing === w.id
                                  ? "Verificando..."
                                  : "Atualizar"}
                              </Button>
                            )}
                            {w.status === "pending" &&
                              !w.simpayWithdrawalId && (
                                <Button
                                  disabled={cancelling === w.id}
                                  onClick={() => handleCancel(w.id)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  {cancelling === w.id
                                    ? "Cancelando..."
                                    : "Cancelar"}
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <LocalPagination
              currentPage={withdrawalsPage}
              onPageChange={setWithdrawalsPage}
              totalItems={filteredWithdrawals.length}
            />
          </CardContent>
        </Card>
      )}
    </TooltipProvider>
  );
}
