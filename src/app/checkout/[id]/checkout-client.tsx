"use client";

import { Navbar } from "@/app/landing/components/Navbar";
import ModernCheckoutForm, {
  type CheckoutSidebarActionState,
  type ModernCheckoutFormHandle,
} from "@/components/checkout/ModernCheckoutForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import type { CheckoutRates } from "./page";
import { CreditCard, Loader2, ShieldCheck, Ticket, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { applyVoucher, consumeVoucher } from "@/app/(auth)/vouchers/actions";

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
}

export default function CheckoutClient({
  invoice,
  user,
  reference,
  initialStep,
}: CheckoutClientProps) {
  const base = invoice.amount;
  const checkoutFormRef = useRef<ModernCheckoutFormHandle>(null);
  const userHasDomId = !!user?.organization?.domId;

  const [rates, setRates] = useState<CheckoutRates | null>(null);

  useEffect(() => {
    const apiUrl = (process.env.NEXT_PUBLIC_SIMPAY_API_URL ?? "https://simpay-back.simintermediacoes.com").replace(/\/+$/, "");
    fetch(`${apiUrl}/checkout/public/cc-rates/ATLAS`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json && typeof json.domCcRate === "number" && typeof json.masterCcRate === "number") {
          setRates(json as CheckoutRates);
        }
      })
      .catch(() => {});
  }, []);

  const [sidebarAction, setSidebarAction] = useState<CheckoutSidebarActionState>({
    label: "Finalizar Transação",
    disabled: false,
  });

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const isCreditCard = selectedMethod !== "pix";

  const onPaymentMethodChange = useCallback((method: string | null) => {
    setSelectedMethod(method);
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
      setSidebarAction((prev) =>
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
          voucherId: result.voucherId,
          discount: result.discount,
          finalAmount: result.finalAmount,
          message: result.message,
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
  const buyerFee = isCreditCard && rates ? Math.round(displayBase * (rates.domCcRate + rates.masterCcRate) * 100) / 100 : null;
  const displayTotal = buyerFee !== null ? Math.round((displayBase + buyerFee) * 100) / 100 : displayBase;

  return (
    <div className="relative z-0 w-full min-h-screen overflow-x-hidden bg-[#000B12] pb-12 pt-32">
      <Navbar variant="dark" />
      <div className="fixed inset-0 bg-landing-gradient opacity-40 pointer-events-none" />
      <div className="container mx-auto px-6 py-4 md:py-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              Finalizar Compra
            </h1>
            <p className="mt-3 text-sm font-bold text-slate-400 uppercase tracking-widest opacity-80">
              Complete o pagamento de forma segura e rápida
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ModernCheckoutForm
                ref={checkoutFormRef}
                invoiceId={invoice.id}
                hasExistingUser={userHasDomId}
                initialStep={initialStep}
                onSidebarActionStateChange={onSidebarActionStateChange}
                onPaymentMethodChange={onPaymentMethodChange}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 z-10 space-y-6 lg:top-6">
                <Card className="shadow-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillTrendUp className="h-5 w-5 text-emerald-400" />
                        <span className="font-black text-white uppercase tracking-tight text-xs">
                          100% de cashback garantido
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest leading-relaxed">
                        Todos os seus gastos serão convertidos em vale-compras.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-sky-400" />
                        <span className="font-black text-white uppercase tracking-tight text-xs">
                          Pagamento 100% Seguro
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                        Seus dados estão protegidos com criptografia SSL de
                        ponta a ponta. Aceitamos cartão e PIX.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden">
                  <CardHeader className="pb-4 border-b border-white/5">
                    <CardTitle className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest">
                      <CreditCard className="h-4 w-4 text-sky-400" />
                      Resumo do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-black text-white uppercase tracking-tight text-xs">
                            {invoice.type === "domain" ? "Domínio" : "Plano"}
                          </p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                            {reference}
                          </p>
                        </div>
                        <p className="font-black text-white whitespace-nowrap">
                          {toBrl(invoice.amount)}
                        </p>
                      </div>

                      {invoice.type === "domain" && (
                        <>
                          {whoisGuard && (
                            <div className="flex items-center justify-between gap-2 border-t border-white/5 py-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  Privacidade WHOIS
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase">
                                  Grátis
                                </Badge>
                                <span className="font-black text-white">{toBrl(0)}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between py-3 border-t border-white/5">
                            <div className="flex items-center gap-2 w-full">
                              <ShieldCheck className="h-4 w-4 text-emerald-400" />
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certificado SSL</span>
                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black uppercase">
                                  Grátis
                                </Badge>
                                <span className="font-black text-white">{toBrl(0)}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-sky-400" />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cupom de Desconto</span>
                      </div>

                      {appliedVoucher ? (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                              {voucherCode.toUpperCase()}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-tight">
                              -{toBrl(appliedVoucher.discount)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveVoucher}
                            className="h-8 w-8 p-0 hover:bg-white/5 rounded-full"
                          >
                            <X className="h-4 w-4 text-emerald-400" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="CÓDIGO"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            className="h-10 border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-slate-500 focus:border-sky-500/50 transition-all text-white outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleApplyVoucher();
                              }
                            }}
                          />
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => void handleApplyVoucher()}
                            disabled={voucherLoading || !voucherCode.trim()}
                            className="shrink-0 h-10 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-xl transition-all shadow-lg shadow-sky-500/20"
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
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight mt-2 px-1">{voucherError}</p>
                      )}
                    </div>

                    {buyerFee !== null && buyerFee > 0 && rates && (
                      <div className="flex items-center justify-between gap-2 border-t border-white/5 py-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Taxa de Processamento
                        </span>
                        <span className="font-black text-orange-400">
                          +{toBrl(buyerFee)}
                        </span>
                      </div>
                    )}

                    <Separator className="bg-white/5" />

                    {appliedVoucher && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                          Desconto Voucher
                        </span>
                        <span className="font-black text-emerald-400">
                          -{toBrl(appliedVoucher.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-black text-white uppercase tracking-tight">
                        Total
                      </span>
                      <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                        {toBrl(displayTotal)}
                      </span>
                    </div>

                    <div className="pt-6 space-y-3">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Benefícios Inclusos:
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        <li className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          Suporte VIP 24/7
                        </li>
                        <li className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          99.9% Uptime SLA
                        </li>
                        <li className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          Backups de Segurança
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {!sidebarAction.hidden && (
                  <GradientButton
                    className="w-full text-lg px-4 min-w-full cursor-pointer disabled:opacity-60"
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
    </div>
  );
}
