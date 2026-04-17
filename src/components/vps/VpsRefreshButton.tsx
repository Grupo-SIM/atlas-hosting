"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { refreshVpsDataAction } from "@/app/vps-actions";

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
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleRefresh}
      className={cn(
        "gap-2 h-9 border-2 transition-all active:scale-95",
        isPending && "bg-muted"
      )}
    >
      <RefreshCw 
        className={cn(
          "h-4 w-4 text-emerald-500", 
          (isPending || manualSpin) && "animate-spin"
        )} 
      />
      <span className="hidden sm:inline font-bold uppercase tracking-tighter text-[10px]">
        {isPending ? "Sincronizando..." : "Atualizar agora"}
      </span>
    </Button>
  );
}
