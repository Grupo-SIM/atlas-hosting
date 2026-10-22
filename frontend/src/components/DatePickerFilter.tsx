"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangeValue = { from: string; to: string } | null;

interface DatePickerFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
}

function toDate(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

export function DatePickerFilter({
  value,
  onChange,
  placeholder = "Filtrar por período",
}: DatePickerFilterProps) {
  const [open, setOpen] = useState(false);

  const selected: DateRange | undefined = value
    ? { from: toDate(value.from), to: toDate(value.to) }
    : undefined;

  const label = value
    ? value.from === value.to
      ? format(toDate(value.from), "dd/MM/yyyy", { locale: ptBR })
      : `${format(toDate(value.from), "dd/MM/yy", { locale: ptBR })} – ${format(toDate(value.to), "dd/MM/yy", { locale: ptBR })}`
    : placeholder;

  return (
    <div className="flex items-center gap-1">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-56 justify-start gap-2 font-normal",
              !value && "text-muted-foreground"
            )}
            variant="outline"
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            initialFocus
            locale={ptBR}
            mode="range"
            numberOfMonths={2}
            onSelect={range => {
              if (!range?.from) {
                onChange(null);
                return;
              }
              const from = format(range.from, "yyyy-MM-dd");
              const to = range.to ? format(range.to, "yyyy-MM-dd") : from;
              onChange({ from, to });
            }}
            selected={selected}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          className="h-9 w-9 shrink-0"
          onClick={() => onChange(null)}
          size="icon"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
