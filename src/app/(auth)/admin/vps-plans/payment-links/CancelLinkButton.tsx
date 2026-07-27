"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { cancelVpsPaymentLinkAction } from "./actions";

export function CancelLinkButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      className="text-red-500 hover:bg-red-500/10 gap-2"
      onClick={() => {
        startTransition(async () => {
          try {
            await cancelVpsPaymentLinkAction(id);
            toast.success("Link cancelado.");
          } catch {
            toast.error("Erro ao cancelar o link.");
          }
        });
      }}
    >
      <XCircle className="h-4 w-4" />
      Cancelar
    </Button>
  );
}
