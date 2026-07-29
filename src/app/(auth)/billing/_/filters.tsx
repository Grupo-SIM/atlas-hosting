"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SimpayCalendar } from "./simpay-calendar";

export function BillingFilters({
  status: initialStatus,
  type: initialType,
  date: initialDate,
  from,
  to,
}: {
  status: string;
  type: string;
  date: string;
  from?: string;
  to?: string;
}) {
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
    <div
      className={cn(
        "mb-8 flex flex-col gap-6 transition-opacity",
        isPending && "opacity-70"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Tabs
            className="w-full sm:w-auto"
            onValueChange={v => handleFilter("status", v)}
            value={initialStatus}
          >
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="paid">Pagas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {(initialStatus !== "all" ||
          initialType !== "all" ||
          initialDate !== "all") && (
          <Button
            className="text-muted-foreground"
            onClick={clearFilters}
            size="sm"
            variant="ghost"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl bg-muted/30 p-1">
        {[
          { label: "Todo período", value: "all" },
          { label: "Hoje", value: "today" },
          { label: "Último Mês", value: "month" },
          { label: "Personalizado", value: "custom" },
        ].map(d => (
          <button
            className={cn(
              "rounded-lg px-4 py-2 font-medium text-sm transition-all",
              initialDate === d.value
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
            key={d.value}
            onClick={() => handleFilter("date", d.value)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {initialDate === "custom" && (
        <div className="fade-in slide-in-from-top-2 max-w-sm animate-in">
          <SimpayCalendar
            end={to ? new Date(`${to}T12:00:00`) : null}
            label="Escolha o Período"
            onChange={(start, end) => {
              const params = new URLSearchParams(window.location.search);
              if (start) params.set("from", format(start, "yyyy-MM-dd"));
              else params.delete("from");

              if (end) params.set("to", format(end, "yyyy-MM-dd"));
              else params.delete("to");

              router.push(`/billing?${params.toString()}`, { scroll: false });
            }}
            start={from ? new Date(`${from}T12:00:00`) : null}
          />
        </div>
      )}
    </div>
  );
}
