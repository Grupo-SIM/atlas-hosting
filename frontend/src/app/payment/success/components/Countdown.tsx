"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { checkIsLoggedIn, clearGuestCheckoutSession } from "@/app/actions";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(5);
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId") ?? undefined;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkIsLoggedIn().then(setIsLoggedIn);
  }, []);

  useEffect(() => {
    void clearGuestCheckoutSession(invoiceId);

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [invoiceId]);

  useEffect(() => {
    if (timeLeft <= 0 && isLoggedIn !== null) {
      if (isLoggedIn) {
        router.replace("/domains");
      } else {
        router.replace("/login");
      }
    }
  }, [timeLeft, router, isLoggedIn]);

  return (
    <div className="rounded-full border border-border/50 bg-muted/50 px-4 py-2 font-medium text-muted-foreground text-sm">
      Redirecionando em{" "}
      <span className="font-bold text-primary">{timeLeft}</span> segundos...
    </div>
  );
}
