"use client";

import { XCircle } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelVpsPaymentLinkAction } from "./actions";

export function CancelLinkButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="gap-2 text-red-500 hover:bg-red-500/10"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            await cancelVpsPaymentLinkAction(id);
            toast.success("Link cancelado.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao cancelar o link.");
          }
        });
      }}
      size="sm"
      variant="outline"
    >
      <XCircle className="h-4 w-4" />
      Cancelar
    </Button>
  );
}
