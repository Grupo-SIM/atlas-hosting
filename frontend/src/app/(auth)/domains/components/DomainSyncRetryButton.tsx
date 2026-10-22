"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function DomainSyncRetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      aria-label="Tentar sincronizar domínio novamente"
      className="h-7 cursor-pointer gap-1 px-2 text-xs"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      size="sm"
      variant="outline"
    >
      <RefreshCw className={pending ? "h-3 w-3 animate-spin" : "h-3 w-3"} />
      {pending ? "Tentando..." : "Tentar novamente"}
    </Button>
  );
}
