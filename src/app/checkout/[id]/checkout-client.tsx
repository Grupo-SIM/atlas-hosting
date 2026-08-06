"use client";

import {
  ArrowLeft,
  CreditCard,
  Loader2,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { applyVoucher, consumeVoucher } from "@/app/(auth)/vouchers/actions";
import { Footer } from "@/app/landing/components/Footer";
import ModernCheckoutForm, {
  type CheckoutSidebarActionState,
  type ModernCheckoutFormHandle,
} from "@/components/checkout/ModernCheckoutForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import type { CheckoutRates } from "./page";

/** Taxa extra cobrada em cima do valor da fatura quando o pagamento é via boleto — ver BOLETO_FEE em actions.ts. Configurável via env NEXT_PUBLIC_BOLETO_FEE. */
const BOLETO_FEE = Number(process.env.NEXT_PUBLIC_BOLETO_FEE ?? 7);

interface User {
  id: string;
  organization?: {
    domId?: string | null;
  } | null;
}

interface CheckoutClientProps {
  invoice: Invoice;
  user: User | null;
  reference: string;
  initialStep?: "billing" | "payment";
  isAnnualVps?: boolean;
  allowBoleto?: boolean;
}

export default function CheckoutClient({
  invoice,
  user,
  reference,
  initialStep,
  isAnnualVps,
  allowBoleto,
}: CheckoutClientProps) {
  const router = useRouter();
  const base = invoice.amount;
  const checkoutFormRef = useRef<ModernCheckoutFormHandle>(null);
  const userHasDomId = !!user?.organization?.domId;

  const [rates, setRates] = useState<CheckoutRates | null>(null);

  useEffect(() => {
    const apiUrl = (
      process.env.NEXT_PUBLIC_SIMPAY_API_URL ??
      "https://simpay-back.simintermediacoes.com"
    ).replace(/\/+$/, "");
    fetch(`${apiUrl}/checkout/public/cc-rates/ATLAS`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (
          json &&
          typeof json.domCcRate === "number" &&
          typeof json.masterCcRate === "number"
        ) {
          setRates(json as CheckoutRates);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let canExpire = false;
    const timer = setTimeout(() => {
      canExpire = true;
    }, 2000);

    const expireInvoice = () => {
      if (!canExpire) return;
      fetch(`/api/invoices/${invoice.id}/expire`, {
        keepalive: true,
        method: "POST",
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", expireInvoice);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", expireInvoice);
      expireInvoice();
    };
  }, [invoice.id]);

  const [sidebarAction, setSidebarAction] =
    useState<CheckoutSidebarActionState>({
      disabled: false,
      label: "Finalizar Transação",
    });

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const isCreditCard = selectedMethod !== "pix" && selectedMethod !== "boleto";
  const [selectedInstallments, setSelectedInstallments] = useState(1);

  const onPaymentMethodChange = useCallback((method: string | null) => {
    setSelectedMethod(method);
    setSelectedInstallments(1);
  }, []);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    voucherId: string;
    discount: number;
    finalAmount: number;
    message: string;
  } | null>(null);

  const onSidebarActionStateChange = useCallback(
    (next: CheckoutSidebarActionState) => {
      setSidebarAction(prev =>
        prev.label === next.label && prev.disabled === next.disabled
          ? prev
          : next
      );
    },
    []
  );

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;

    setVoucherLoading(true);
    setVoucherError(null);

    try {
      const result = await applyVoucher(invoice.id, voucherCode);

      if (result.status === "error") {
        setVoucherError(result.message);
      } else {
        setAppliedVoucher({
          discount: result.discount,
          finalAmount: result.finalAmount,
          message: result.message,
          voucherId: result.voucherId,
        });
        await consumeVoucher(invoice.id, result.voucherId);
      }
    } catch {
      setVoucherError("Erro ao aplicar voucher.");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  };

  const whoisGuard = (invoice.metadata as any)?.whoisguard === "on";
  const displayBase = appliedVoucher ? appliedVoucher.finalAmount : base;
  const installmentRate = rates?.installments?.find(
    i => i.n === selectedInstallments
  );
  const buyerFee =
    isCreditCard && installmentRate && installmentRate.buyerRate > 0
      ? Math.round(
          (displayBase * installmentRate.buyerRate + installmentRate.fixedFee) *
            100
        ) / 100
      : null;
  const boletoFee = selectedMethod === "boleto" ? BOLETO_FEE : null;
  const displayTotal =
    boletoFee !== null
      ? Math.round((displayBase + boletoFee) * 100) / 100
      : buyerFee !== null
        ? Math.round((displayBase + buyerFee) * 100) / 100
        : displayBase;

  return (
    <div className="relative z-0 min-h-screen w-full overflow-x-hidden bg-[#000B12] pt-8 pb-12">
      <div className="pointer-events-none fixed inset-0 bg-landing-gradient opacity-40" />
      <div className="container relative z-10 mx-auto px-6 py-4 md:py-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <button
              className="group flex items-center gap-2 font-bold text-sky-400 text-sm transition-colors hover:text-sky-300"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar
            </button>
          </div>

          <div className="mb-12 text-center">
            <h1 className="font-black text-4xl text-white uppercase tracking-tight drop-shadow-sm">
              Finalizar Compra
            </h1>
            <p className="mt-3 font-bold text-slate-400 text-sm uppercase tracking-widest opacity-80">
              Complete o pagamento de forma segura e rápida
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="order-2 lg:order-1 lg:col-span-2">
              <ModernCheckoutForm
                allowBoleto={allowBoleto}
                hasExistingUser={userHasDomId}
                initialStep={initialStep}
                installmentRates={rates?.installments}
                invoiceId={invoice.id}
                invoiceType={invoice.type}
                isAnnualVps={isAnnualVps}
                onInstallmentsChange={setSelectedInstallments}
                onPaymentMethodChange={onPaymentMethodChange}
                onSidebarActionStateChange={onSidebarActionStateChange}
                ref={checkoutFormRef}
                selectedInstallments={selectedInstallments}
              />
            </div>

            <div className="order-1 lg:order-2 lg:col-span-1">
              <div className="sticky top-4 z-10 space-y-6 lg:top-6">
                <Card className="overflow-hidden border border-emerald-500/20 bg-emerald-500/5 shadow-2xl backdrop-blur-md">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillTrendUp className="h-5 w-5 text-emerald-400" />
                        <span className="font-black text-white text-xs uppercase tracking-tight">
                          100% de cashback garantido
                        </span>
                      </div>
                      <p className="font-bold text-[10px] text-emerald-500/70 uppercase leading-relaxed tracking-widest">
                        Todos os seus gastos serão convertidos em vale-compras,
                        até R$ 250 por transação.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-sky-400" />
                        <span className="font-black text-white text-xs uppercase tracking-tight">
                          Pagamento 100% Seguro
                        </span>
                      </div>
                      <p className="font-bold text-[10px] text-slate-500 uppercase leading-relaxed tracking-widest">
                        Seus dados estão protegidos com criptografia SSL de
                        ponta a ponta. Aceitamos cartão e PIX.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
                  <CardHeader className="border-white/5 border-b pb-4">
                    <CardTitle className="flex items-center gap-3 font-black text-sm text-white uppercase tracking-widest">
                      <CreditCard className="h-4 w-4 text-sky-400" />
                      Resumo do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-black text-white text-xs uppercase tracking-tight">
                            {invoice.type === "domain" ? "Domínio" : "Plano"}
                          </p>
                          <p className="font-bold text-[11px] text-slate-500 uppercase leading-tight tracking-wider">
                            {reference}
                          </p>
                        </div>
                        <p className="whitespace-nowrap font-black text-white">
                          {toBrl(invoice.amount)}
                        </p>
                      </div>

                      {isCreditCard &&
                        invoice.type === "domain" &&
                        rates?.installments &&
                        rates.installments.length > 0 && (
                          <div className="flex items-center justify-between gap-4 border-white/5 border-t pt-3">
                            <span className="whitespace-nowrap font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                              Parcelas
                            </span>
                            <Select
                              onValueChange={v =>
                                setSelectedInstallments(Number(v))
                              }
                              value={String(selectedInstallments)}
                            >
                              <SelectTrigger className="h-8 w-36 cursor-pointer border-white/10 bg-white/5 font-bold text-white text-xs focus:ring-sky-500/50 [&>svg]:text-slate-400">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-white/10 bg-slate-900">
                                {rates.installments.map(r => (
                                  <SelectItem
                                    className="cursor-pointer font-bold text-white text-xs focus:bg-white/10 focus:text-white"
                                    key={r.n}
                                    value={String(r.n)}
                                  >
                                    {r.n === 1 ? "1x — sem juros" : `${r.n}x`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                      {invoice.type === "domain" && (
                        <>
                          {whoisGuard && (
                            <div className="flex items-center justify-between gap-2 border-white/5 border-t py-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                                  Privacidade WHOIS
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge className="border-emerald-500/20 bg-emerald-500/10 font-black text-[9px] text-emerald-400 uppercase">
                                  Grátis
                                </Badge>
                                <span className="font-black text-white">
                                  {toBrl(0)}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-white/5 border-t py-3">
                            <div className="flex w-full items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-emerald-400" />
                              <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                                Certificado SSL
                              </span>
                              <div className="flex flex-1 items-center justify-end gap-2">
                                <Badge className="border-emerald-500/20 bg-emerald-500/10 font-black text-[9px] text-emerald-400 uppercase">
                                  Grátis
                                </Badge>
                                <span className="font-black text-white">
                                  {toBrl(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-4 border-white/5 border-t pt-6">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-sky-400" />
                        <span className="font-black text-[11px] text-slate-400 uppercase tracking-widest">
                          Cupom de Desconto
                        </span>
                      </div>

                      {appliedVoucher ? (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                          <div>
                            <p className="font-black text-emerald-400 text-xs uppercase tracking-widest">
                              {voucherCode.toUpperCase()}
                            </p>
                            <p className="font-bold text-[10px] text-emerald-500/70 uppercase tracking-tight">
                              -{toBrl(appliedVoucher.discount)}
                            </p>
                          </div>
                          <Button
                            className="h-8 w-8 rounded-full p-0 hover:bg-white/5"
                            onClick={handleRemoveVoucher}
                            size="sm"
                            variant="ghost"
                          >
                            <X className="h-4 w-4 text-emerald-400" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            className="h-10 rounded-xl border-white/20 bg-white/5 font-bold text-white text-xs uppercase tracking-widest outline-none transition-all placeholder:text-slate-500 hover:bg-white/10 focus:border-sky-500/50"
                            onChange={e =>
                              setVoucherCode(e.target.value.toUpperCase())
                            }
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleApplyVoucher();
                              }
                            }}
                            placeholder="CÓDIGO"
                            value={voucherCode}
                          />
                          <Button
                            className="h-10 shrink-0 rounded-xl bg-sky-500 px-6 font-black text-[10px] text-white uppercase tracking-widest shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-600"
                            disabled={voucherLoading || !voucherCode.trim()}
                            onClick={() => void handleApplyVoucher()}
                            size="sm"
                            variant="default"
                          >
                            {voucherLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Aplicar"
                            )}
                          </Button>
                        </div>
                      )}

                      {voucherError && (
                        <p className="mt-2 px-1 font-bold text-[10px] text-rose-500 uppercase tracking-tight">
                          {voucherError}
                        </p>
                      )}
                    </div>

                    {buyerFee !== null && buyerFee > 0 && rates && (
                      <div className="flex items-center justify-between gap-2 border-white/5 border-t py-4">
                        <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                          Taxa de Processamento
                        </span>
                        <span className="font-black text-orange-400">
                          +{toBrl(buyerFee)}
                        </span>
                      </div>
                    )}

                    {boletoFee !== null && (
                      <div className="flex items-center justify-between gap-2 border-white/5 border-t py-4">
                        <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                          Taxa de Boleto
                        </span>
                        <span className="font-black text-orange-400">
                          +{toBrl(boletoFee)}
                        </span>
                      </div>
                    )}

                    <Separator className="bg-white/5" />

                    {appliedVoucher && (
                      <div className="flex items-center justify-between py-1">
                        <span className="font-bold text-[11px] text-emerald-400 uppercase tracking-wider">
                          Desconto Voucher
                        </span>
                        <span className="font-black text-emerald-400">
                          -{toBrl(appliedVoucher.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-black text-white text-xl uppercase tracking-tight">
                        Total
                      </span>
                      <div className="text-right">
                        <span className="font-black text-2xl text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                          {toBrl(displayTotal)}
                        </span>
                        {isCreditCard && selectedInstallments > 1 && (
                          <p className="mt-0.5 font-bold text-[10px] text-slate-400">
                            {selectedInstallments}x de{" "}
                            {toBrl(
                              Math.round(
                                (displayTotal / selectedInstallments) * 100
                              ) / 100
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-6">
                      <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest">
                        Benefícios Inclusos:
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        <li className="flex items-center gap-3 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          Suporte VIP 24/7
                        </li>
                        <li className="flex items-center gap-3 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          99.9% Uptime SLA
                        </li>
                        <li className="flex items-center gap-3 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          Backups de Segurança
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {!sidebarAction.hidden && (
                  <GradientButton
                    className="w-full min-w-full cursor-pointer px-4 text-lg disabled:opacity-60"
                    disabled={sidebarAction.disabled}
                    onClick={() => {
                      checkoutFormRef.current?.submit();
                    }}
                  >
                    {sidebarAction.label}
                  </GradientButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
