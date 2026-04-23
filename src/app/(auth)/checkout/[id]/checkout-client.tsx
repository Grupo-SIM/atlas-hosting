"use client";

import ModernCheckoutForm, {
  type CheckoutSidebarActionState,
  type ModernCheckoutFormHandle,
} from "@/components/checkout/ModernCheckoutForm";
import Topbar from "@/components/layouts/components/Topbar";
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
  user: User;
  reference: string;
}


export default function CheckoutClient({
  invoice,
  user,
  reference,
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

  const [sidebarAction, setSidebarAction] = useState<CheckoutSidebarActionState>(
    {
      label: "Finalizar Transação",
      disabled: false,
    }
  );

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  // Mostra taxa CC por padrão; esconde apenas quando PIX for explicitamente selecionado
  const isCreditCard = selectedMethod !== "pix";

  const onPaymentMethodChange = useCallback((method: string | null) => {
    setSelectedMethod(method);
  }, []);

  // Voucher state
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
        // Consumir o voucher imediatamente (atualiza a fatura)
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

  const whoisGuard = invoice.metadata?.whoisguard === "on";
  const displayBase  = appliedVoucher ? appliedVoucher.finalAmount : base;
  // Taxa CC só se aplica ao comprador quando método é cartão (não PIX)
  const buyerFee     = isCreditCard && rates ? Math.round(displayBase * (rates.domCcRate + rates.masterCcRate) * 100) / 100 : null;
  const displayTotal = buyerFee !== null ? Math.round((displayBase + buyerFee) * 100) / 100 : displayBase;

  return (
    <div className="relative z-0 w-full min-h-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-12 pt-4 md:pt-6">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Finalizar Compra
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Complete o pagamento de forma segura
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <ModernCheckoutForm
                ref={checkoutFormRef}
                invoiceId={invoice.id}
                hasExistingUser={userHasDomId}
                onSidebarActionStateChange={onSidebarActionStateChange}
                onPaymentMethodChange={onPaymentMethodChange}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 z-10 space-y-6 lg:top-6">
                {/* Order Details */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5" />
                      Resumo do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invoice.type === "domain" ? "Domínio" : "Plano"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {reference}
                          </p>
                        </div>
                        <p className="font-semibold text-right">
                          {toBrl(invoice.amount)}
                        </p>
                      </div>

                      {invoice.type === "domain" && (
                        <>
                          {whoisGuard && (
                            <div className="flex items-center justify-between gap-2 border-t border-gray-100 py-2 dark:border-gray-700">
                              <div className="flex min-w-0 items-center gap-2">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
                                <span className="text-sm">
                                  Proteção de privacidade WHOIS
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  Grátis
                                </Badge>
                                <span className="font-medium">{toBrl(0)}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 w-full">
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Certificado SSL</span>
                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <Badge variant="secondary" className="text-xs">
                                  Grátis
                                </Badge>
                                <span className="font-medium">{toBrl(0)}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Voucher Input */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Voucher de Desconto</span>
                      </div>

                      {appliedVoucher ? (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                              {voucherCode.toUpperCase()}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              -{toBrl(appliedVoucher.discount)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveVoucher}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4 text-green-700 dark:text-green-400" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Código do voucher"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleApplyVoucher();
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleApplyVoucher}
                            disabled={voucherLoading || !voucherCode.trim()}
                            className="shrink-0"
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
                        <p className="text-xs text-red-500 mt-1">{voucherError}</p>
                      )}
                    </div>
                    {buyerFee !== null && buyerFee > 0 && rates && (
                      <div className="flex items-center justify-between gap-2 border-t border-gray-100 py-2 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Taxa cartão
                        </span>
                        <span className="font-medium text-orange-500">
                          +{toBrl(buyerFee)}
                        </span>
                      </div>
                    )}

                    <Separator />

                    {/* Discount line */}
                    {appliedVoucher && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          Desconto do voucher
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          -{toBrl(appliedVoucher.discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {toBrl(displayTotal)}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="pt-4 space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Incluído no seu pedido:
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Suporte 24/7
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          99.9% de uptime garantido
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Backup automático
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          SSL gratuito
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>


                {/* Security & Trust */}
                <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-sm">
                          Pagamento 100% Seguro
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Seus dados estão protegidos com criptografia SSL de
                        ponta a ponta. Aceitamos cartão e PIX.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Money Back Guarantee */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillTrendUp className="h-5 w-5 text-emerald-600" />
                        <span className="font-medium text-emerald-800 dark:text-emerald-200">
                          100% de cashback garantido
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Todos os seus gastos serão convertidos em vale-compras.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <GradientButton
                  className="w-full text-lg px-4 min-w-full cursor-pointer disabled:opacity-60"
                  disabled={sidebarAction.disabled}
                  onClick={() => {
                    checkoutFormRef.current?.submit();
                  }}
                >
                  {sidebarAction.label}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

