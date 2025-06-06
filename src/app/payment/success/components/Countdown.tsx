"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTime = prevTimeLeft - 1;

        if (newTime === 0) {
          router.push("/billing");
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return <div>Você será redirecionado em {timeLeft} segundos...</div>;
}
