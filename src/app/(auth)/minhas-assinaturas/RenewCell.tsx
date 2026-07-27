"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QrCode, Barcode } from "lucide-react";
import { createVpsRenewalInvoice } from "@/app/actions";

interface Props {
  id: string;
  status: "active" | "cancelled" | "failed" | "paused";
  paymentMethod: "credit_card" | "pix" | "boleto";
  nextChargeDate: Date;
}

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function RenewCell({ id, status, paymentMethod, nextChargeDate }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const dueSoon = new Date(nextChargeDate).getTime() <= Date.now() + FIFTEEN_DAYS_MS;
  const canRenew =
    (paymentMethod === "pix" || paymentMethod === "boleto") &&
    (status === "paused" || (status === "active" && dueSoon));

  if (!canRenew) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const handleRenew = () => {
    startTransition(async () => {
      const result = await createVpsRenewalInvoice(id);
      if (result.status === "success") {
        router.push(result.redirectUrl);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button size="sm" disabled={pending} onClick={handleRenew} className="gap-1">
      {paymentMethod === "boleto" ? <Barcode className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
      Renovar com {paymentMethod === "boleto" ? "Boleto" : "PIX"}
    </Button>
  );
}
