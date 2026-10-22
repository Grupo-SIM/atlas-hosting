"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VpsOrderInfo {
  orderNumber: string;
  amount: number;
  currency: string;
  planType: string;
}

function formatPrice(amount: number, currency: string): string {
  const fixed = amount.toFixed(2).replace(".", ",");
  if (currency === "EUR") return `€ ${fixed}`;
  if (currency === "USD") return `$ ${fixed}`;
  return `R$ ${fixed}`;
}

export default function VpsOrderModal({ order }: { order: VpsOrderInfo }) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 text-gray-900 shadow-2xl">
        <div className="p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className="font-bold text-2xl text-gray-900 leading-tight">
              Obrigado pelo seu pedido.
            </h2>
            <span className="shrink-0 rounded-md bg-emerald-600 px-4 py-2 font-semibold text-sm text-white">
              Pagamento recebido
            </span>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">
              Número do pedido :{" "}
              <span className="font-bold">{order.orderNumber}</span>
            </span>
            <span className="font-bold text-gray-800 text-sm">
              {formatPrice(order.amount, order.currency)}
            </span>
          </div>

          <hr className="mb-6 border-gray-200" />

          <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
            <p>
              Seu pagamento e pedido foram recebidos e estão sendo processados.
            </p>

            <p>Tempos de provisionamento previstos:</p>

            <p>
              <strong>VPS e VDS:</strong> 30 minutos (até 3 horas em casos
              excepcionais) <strong>VDS com SSD adicional:</strong> 48 horas (em
              dias úteis) <strong>Servidor Dedicado:</strong> 48 horas (em dias
              úteis) <strong>Armazenamento de Objetos:</strong> Instantâneo
            </p>

            <p>
              Na maioria dos casos, conseguimos processar seu pedido em um tempo
              muito menor; em casos raros, pode levar mais tempo.
            </p>

            <p>
              Assim que o provisionamento for concluído, você receberá um e-mail
              com as credenciais de login. Nenhuma ação é necessária da sua
              parte. Não é preciso entrar em contato conosco a esse respeito.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
