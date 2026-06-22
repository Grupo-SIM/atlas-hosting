"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type VpsOrderInfo = {
  orderNumber: string;
  amount: number;
  currency: string;
  planType: string;
};

function formatPrice(amount: number, currency: string): string {
  const fixed = amount.toFixed(2).replace(".", ",");
  if (currency === "EUR") return `€ ${fixed}`;
  if (currency === "USD") return `$ ${fixed}`;
  return `R$ ${fixed}`;
}

export default function VpsOrderModal({ order }: { order: VpsOrderInfo }) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-white text-gray-900 p-0 overflow-hidden border-0 shadow-2xl rounded-2xl gap-0">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              Obrigado pelo seu pedido.
            </h2>
            <span className="shrink-0 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-md">
              Pagamento recebido
            </span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-gray-800">
              Número do pedido :{" "}
              <span className="font-bold">{order.orderNumber}</span>
            </span>
            <span className="text-sm font-bold text-gray-800">
              {formatPrice(order.amount, order.currency)}
            </span>
          </div>

          <hr className="border-gray-200 mb-6" />

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Seu pagamento e pedido foram recebidos e estão sendo processados.
            </p>

            <p>Tempos de provisionamento previstos:</p>

            <p>
              <strong>VPS e VDS:</strong> 30 minutos (até 3 horas em casos
              excepcionais){" "}
              <strong>VDS com SSD adicional:</strong> 48 horas (em dias úteis){" "}
              <strong>Servidor Dedicado:</strong> 48 horas (em dias úteis){" "}
              <strong>Armazenamento de Objetos:</strong> Instantâneo
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
