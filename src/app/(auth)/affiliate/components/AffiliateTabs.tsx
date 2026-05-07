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
import { syncWithdrawalStatus } from "../actions";

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
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    available: "default",
    withdrawn: "secondary",
    pending: "outline",
    approved: "default",
    rejected: "destructive",
  };
  const labelMap: Record<string, string> = {
    available: "Disponível",
    withdrawn: "Sacado",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  return (
    <Badge variant={variantMap[status] ?? "outline"}>
      {labelMap[status] ?? status}
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
  const [syncing, setSyncing] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync(withdrawalId: string) {
    setSyncing(withdrawalId);
    await syncWithdrawalStatus(withdrawalId);
    router.refresh();
    setSyncing(null);
  }

  const tabs = [
    { id: "overview" as const, label: "Visão Geral" },
    { id: "sales" as const, label: "Vendas" },
    { id: "withdrawals" as const, label: "Saques" },
  ];

  return (
    <>
      <WithdrawalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        availableBalance={availableBalance}
        minWithdrawal={minWithdrawal}
        fee={fee}
      />

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
                            <p className="text-xs text-muted-foreground mt-1">
                              {w.rejectionReason}
                            </p>
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
    </>
  );
}
