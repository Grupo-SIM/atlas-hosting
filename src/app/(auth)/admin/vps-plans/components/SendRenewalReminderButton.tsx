"use client";

import { useTransition } from "react";
import { LuMail } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendRenewalReminderAction } from "../actions";

export function SendRenewalReminderButton({ subscriptionId }: { subscriptionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      className="cursor-pointer disabled:cursor-not-allowed"
      disabled={pending}
      onClick={() => startTransition(async () => {
        try {
          const result = await sendRenewalReminderAction(subscriptionId);
          toast[result.status](result.message);
        } catch {
          toast.error("Não foi possível enviar o lembrete. Tente novamente.");
        }
      })}
      size="sm"
      variant="outline"
    >
      <LuMail aria-hidden="true" className="mr-2 h-4 w-4" />
      {pending ? "Enviando…" : "Enviar lembrete"}
    </Button>
  );
}
