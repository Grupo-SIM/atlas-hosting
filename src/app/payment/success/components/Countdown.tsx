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
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [invoiceId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      router.replace("/dashboard");
    }
  }, [timeLeft, router]);

  return (
    <div className="text-sm text-muted-foreground font-medium bg-muted/50 px-4 py-2 rounded-full border border-border/50">
      Redirecionando em <span className="text-primary font-bold">{timeLeft}</span> segundos...
    </div>
  );
}
