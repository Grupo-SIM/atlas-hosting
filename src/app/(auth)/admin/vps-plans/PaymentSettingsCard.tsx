"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { QrCode, Barcode } from "lucide-react";
import { setPixAllowAllDurationsAction, setBoletoEnabledAction } from "./actions";

export function PaymentSettingsCard({
  initialPixAllowAllDurations,
  initialBoletoEnabled,
}: {
  initialPixAllowAllDurations: boolean;
  initialBoletoEnabled: boolean;
}) {
  const [pixEnabled, setPixEnabled] = useState(initialPixAllowAllDurations);
  const [boletoEnabled, setBoletoEnabled] = useState(initialBoletoEnabled);
  const [isPixPending, startPixTransition] = useTransition();
  const [isBoletoPending, startBoletoTransition] = useTransition();

  const handlePixChange = (checked: boolean) => {
    setPixEnabled(checked);
    startPixTransition(async () => {
      try {
        await setPixAllowAllDurationsAction(checked);
        toast.success(
          checked
            ? "PIX liberado para todas as durações (1/12/24 meses)."
            : "PIX restrito ao plano de 24 meses."
        );
      } catch (error) {
        setPixEnabled(!checked);
        toast.error("Erro ao salvar configuração de PIX.");
      }
    });
  };

  const handleBoletoChange = (checked: boolean) => {
    setBoletoEnabled(checked);
    startBoletoTransition(async () => {
      try {
        await setBoletoEnabledAction(checked);
        toast.success(
          checked
            ? "Boleto liberado para qualquer compra."
            : "Boleto desativado."
        );
      } catch (error) {
        setBoletoEnabled(!checked);
        toast.error("Erro ao salvar configuração de boleto.");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Configurações de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            <QrCode className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Liberar PIX para todas as durações</p>
              <p className="text-xs text-muted-foreground">
                {pixEnabled
                  ? "PIX disponível em 1, 12 e 24 meses."
                  : "PIX disponível apenas no plano de 24 meses (padrão)."}
              </p>
            </div>
          </div>
          <Switch checked={pixEnabled} onCheckedChange={handlePixChange} disabled={isPixPending} />
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-start gap-2">
            <Barcode className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Liberar Boleto</p>
              <p className="text-xs text-muted-foreground">
                {boletoEnabled
                  ? "Boleto disponível pra qualquer pessoa que tentar comprar."
                  : "Boleto desativado (padrão) — só cartão e PIX (se liberado)."}
              </p>
            </div>
          </div>
          <Switch checked={boletoEnabled} onCheckedChange={handleBoletoChange} disabled={isBoletoPending} />
        </div>
      </CardContent>
    </Card>
  );
}
