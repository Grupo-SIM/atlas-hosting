"use client";

import { useRef } from "react";
import ModernCheckoutForm, {
  type ModernCheckoutFormHandle,
} from "@/components/checkout/ModernCheckoutForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GradientButton } from "@/components/ui/gradient-button";
import { toBrl } from "@/lib/utils";
import { ShieldCheck, CreditCard, Star } from "lucide-react";
import { FaMoneyBillTransfer, FaMoneyBillTrendUp } from "react-icons/fa6";

interface Invoice {
  id: string;
  type: string;
  amount: number;
  reference: string;
  metadata?: {
    whoisguard?: "on" | "off";
  };
}

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
  const checkoutFormRef = useRef<ModernCheckoutFormHandle>(null);
  const userHasDomId = !!user?.organization?.domId;

  const whoisGuard = invoice.metadata?.whoisguard === "on";

  return (
    <div className="inset-shadow-border inset-shadow-[1px_1px] min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
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
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
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
                          {toBrl(invoice.amount - (whoisGuard ? 3 : 0))}
                        </p>
                      </div>

                      {invoice.type === "domain" && (
                        <>
                          {whoisGuard && (
                            <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  Proteção de privacidade WHOIS
                                </span>
                              </div>
                              <span className="font-medium">{toBrl(3)}</span>
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

                    <Separator />

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {toBrl(invoice.amount)}
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
                        ponta a ponta. Aceitamos cartões de crédito e débito.
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs text-gray-500">
                          Powered by
                        </span>
                        <span className="text-xs font-medium">
                          DOM Pagamentos
                        </span>
                      </div>
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
                  className="w-full text-lg px-4 min-w-full cursor-pointer"
                  onClick={() => {
                    checkoutFormRef.current?.submit();
                  }}
                >
                  Finalizar Transação
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
