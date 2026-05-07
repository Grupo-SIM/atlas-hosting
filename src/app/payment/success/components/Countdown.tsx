"use client";

import { clearGuestCheckoutSession } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId") ?? undefined;

  useEffect(() => {
    void clearGuestCheckoutSession(invoiceId);

    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTime = prevTimeLeft - 1;

        if (newTime === 0) {
          router.replace("/login");
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [invoiceId, router]);

  return (
    <div className="text-sm text-muted-foreground font-medium bg-muted/50 px-4 py-2 rounded-full border border-border/50">
      Redirecionando para o login em <span className="text-primary font-bold">{timeLeft}</span> segundos...
    </div>
  );
}
