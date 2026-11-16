"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MoneyInput } from "@/components/MoneyInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatBrl } from "@/lib/template-exclusivity/rules";
import { updateMinAskingPrice } from "../actions";

/** O dono escolhe o menor valor que aceita receber em propostas. */
export function MinPriceForm({
  current,
  exclusivityId,
  floor,
}: {
  current: number | null;
  exclusivityId: string;
  floor: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(current ?? floor);
  const [busy, setBusy] = useState(false);
  const tooLow = amount < floor;

  return (
    <div className="flex w-full flex-col gap-2 md:w-64">
      <Label htmlFor={`min-${exclusivityId}`}>Valor mínimo de venda</Label>
      <MoneyInput id={`min-${exclusivityId}`} onChange={setAmount} value={amount} />
      <p className={tooLow ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
        Não pode ser menor que {formatBrl(floor)}.
      </p>
      <Button
        disabled={busy || tooLow || amount === current}
        onClick={async () => {
          setBusy(true);
          const result = await updateMinAskingPrice(exclusivityId, amount);
          setBusy(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Valor mínimo atualizado.");
          router.refresh();
        }}
        size="sm"
      >
        {busy && <Loader className="mr-2 size-4 animate-spin" />}
        Salvar valor mínimo
      </Button>
    </div>
  );
}
