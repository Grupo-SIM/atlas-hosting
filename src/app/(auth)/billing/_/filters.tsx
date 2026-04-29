"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SimpayCalendar } from "./simpay-calendar";

import { format } from "date-fns";

export function BillingFilters({ 
  status: initialStatus, 
  type: initialType, 
  date: initialDate,
  from,
  to
}: { status: string; type: string; date: string; from?: string; to?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleFilter = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      // Reset to page 1 on filter change
      params.delete("page");
      
      router.push(`/billing?${params.toString()}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/billing", { scroll: false });
    });
  };

  return (
    <div className={cn("flex flex-col gap-6 mb-8 transition-opacity", isPending && "opacity-70")}>
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Tabs value={initialStatus} onValueChange={(v) => handleFilter("status", v)} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="paid">Pagas</TabsTrigger>
              <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {(initialStatus !== "all" || initialType !== "all" || initialDate !== "all") && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center bg-muted/30 p-1 rounded-xl w-fit gap-1">
        {[
          { label: "Todo período", value: "all" },
          { label: "Hoje", value: "today" },
          { label: "Última Semana", value: "week" },
          { label: "Último Mês", value: "month" },
          { label: "Personalizado", value: "custom" },
        ].map((d) => (
          <button
            key={d.value}
            onClick={() => handleFilter("date", d.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              initialDate === d.value ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {initialDate === "custom" && (
        <div className="animate-in fade-in slide-in-from-top-2 max-w-sm">
          <SimpayCalendar 
            label="Escolha o Período"
            start={from ? new Date(from + "T12:00:00") : null}
            end={to ? new Date(to + "T12:00:00") : null}
            onChange={(start, end) => {
              const params = new URLSearchParams(window.location.search);
              if (start) params.set("from", format(start, "yyyy-MM-dd"));
              else params.delete("from");
              
              if (end) params.set("to", format(end, "yyyy-MM-dd"));
              else params.delete("to");
              
              router.push(`/billing?${params.toString()}`, { scroll: false });
            }}
          />
        </div>
      )}
    </div>
  );
}
