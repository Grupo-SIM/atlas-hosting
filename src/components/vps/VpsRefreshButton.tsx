"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { refreshVpsDataAction } from "@/app/vps-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function VpsRefreshButton({ serverId }: { serverId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manualSpin, setManualSpin] = useState(false);

  const handleRefresh = async () => {
    setManualSpin(true);

    // Primeiro chamamos a ação do servidor para limpar o cache e avisar o bot
    await refreshVpsDataAction(serverId);

    startTransition(() => {
      // Depois pedimos para o Next recarregar a página
      router.refresh();
      setTimeout(() => setManualSpin(false), 800);
    });
  };

  return (
    <Button
      className={cn(
        "h-9 gap-2 border-2 transition-all active:scale-95",
        isPending && "bg-muted"
      )}
      disabled={isPending}
      onClick={handleRefresh}
      size="sm"
      variant="outline"
    >
      <RefreshCw
        className={cn(
          "h-4 w-4 text-emerald-500",
          (isPending || manualSpin) && "animate-spin"
        )}
      />
      <span className="hidden font-bold text-[10px] uppercase tracking-tighter sm:inline">
        {isPending ? "Sincronizando..." : "Atualizar agora"}
      </span>
    </Button>
  );
}
