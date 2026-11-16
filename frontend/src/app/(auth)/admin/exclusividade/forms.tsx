"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { saveResaleSettings, saveTemplateExclusivity } from "./actions";

export function TemplateSettingRow(props: {
  annualPriceBrl: number;
  enabled: boolean;
  hasOwner: boolean;
  templateId: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(props.enabled);
  const [price, setPrice] = useState(props.annualPriceBrl);
  const [busy, setBusy] = useState(false);
  const dirty = enabled !== props.enabled || price !== props.annualPriceBrl;

  const save = async () => {
    setBusy(true);
    const result = await saveTemplateExclusivity({
      annualPriceBrl: price,
      enabled,
      templateId: props.templateId,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      setEnabled(props.enabled);
      return;
    }
    toast.success("Template atualizado.");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={enabled}
          disabled={busy || (props.hasOwner && enabled)}
          onCheckedChange={setEnabled}
        />
        {enabled ? "Aceita" : "Não aceita"}
      </label>
      {enabled && (
        <div className="w-40">
          <MoneyInput onChange={setPrice} value={price} />
        </div>
      )}
      {enabled && <span className="text-muted-foreground text-xs">por ano</span>}
      {dirty && (
        <Button disabled={busy} onClick={save} size="sm">
          {busy && <Loader className="mr-2 size-4 animate-spin" />}
          Salvar
        </Button>
      )}
    </div>
  );
}

export function ResaleSettingsForm(props: {
  feePercent: number;
  minPriceBrl: number;
}) {
  const router = useRouter();
  const [fee, setFee] = useState(String(props.feePercent));
  const [min, setMin] = useState(props.minPriceBrl);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex flex-wrap items-end gap-4"
      onSubmit={async event => {
        event.preventDefault();
        setBusy(true);
        const result = await saveResaleSettings({
          feePercent: Number(fee.replace(",", ".")),
          minPriceBrl: min,
        });
        setBusy(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Configuração de revenda salva.");
        router.refresh();
      }}
    >
      <div className="space-y-1">
        <Label htmlFor="resale-fee">Taxa do Atlas (%)</Label>
        <Input
          className="w-32"
          id="resale-fee"
          inputMode="decimal"
          onChange={event => setFee(event.target.value)}
          value={fee}
        />
      </div>
      <div className="w-48 space-y-1">
        <Label htmlFor="resale-min">Valor mínimo de venda</Label>
        <MoneyInput id="resale-min" onChange={setMin} value={min} />
      </div>
      <Button disabled={busy} type="submit">
        {busy && <Loader className="mr-2 size-4 animate-spin" />}
        Salvar
      </Button>
    </form>
  );
}
