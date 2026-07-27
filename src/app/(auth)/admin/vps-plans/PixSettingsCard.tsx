"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { QrCode } from "lucide-react";
import { setPixAllowAllDurationsAction } from "./actions";

export function PixSettingsCard({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const handleChange = (checked: boolean) => {
    setEnabled(checked);
    startTransition(async () => {
      try {
        await setPixAllowAllDurationsAction(checked);
        toast.success(
          checked
            ? "PIX liberado para todas as durações (1/12/24 meses)."
            : "PIX restrito ao plano de 24 meses."
        );
      } catch (error) {
        setEnabled(!checked);
        toast.error("Erro ao salvar configuração de PIX.");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <QrCode className="h-4 w-4 text-emerald-600" />
        <CardTitle className="text-sm font-medium">Configuração de PIX</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Liberar PIX para todas as durações</p>
          <p className="text-xs text-muted-foreground">
            {enabled
              ? "PIX disponível em 1, 12 e 24 meses."
              : "PIX disponível apenas no plano de 24 meses (padrão)."}
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleChange} disabled={isPending} />
      </CardContent>
    </Card>
  );
}
