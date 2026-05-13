"use client";

import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Utils adapted from Simpay
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

function formatRange(start: Date | null, end: Date | null) {
  if (!start && !end) return "";
  if (start && !end) return `${formatDate(start)}`;
  if (start && end && isSameDay(start, end)) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function rangeDays(start: Date | null, end: Date | null) {
  if (!start || !end) return 0;
  const diff = startOfDay(end).getTime() - startOfDay(start).getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
}

type Props = {
  label: string;
  start: Date | null;
  end: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
};

export function SimpayCalendar({ label, start, end, onChange }: Props) {
  const today = startOfDay(new Date());
  
  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(new Date((end || today).getFullYear(), (end || today).getMonth(), 1));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Internal draft state to prevent jumping during selection
  const [draftStart, setDraftStart] = useState<Date | null>(start);
  const [draftEnd, setDraftEnd] = useState<Date | null>(end);

  // Sync draft with props when popover opens
  useEffect(() => {
    if (open) {
      setDraftStart(start);
      setDraftEnd(end);
    }
  }, [open, start, end]);

  const calendarDays = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDayWeekIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const normalizedStart = (firstDayWeekIndex + 6) % 7;
    const days: Array<{ date: Date; currentMonth: boolean }> = [];

    for (let i = normalizedStart - 1; i >= 0; i -= 1) {
      days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), currentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ date: new Date(year, month, day), currentMonth: true });
    }
    while (days.length < 42) {
      const nextDay = days.length - (normalizedStart + daysInMonth) + 1;
      days.push({ date: new Date(year, month + 1, nextDay), currentMonth: false });
    }
    return days;
  }, [monthCursor]);

  function handleDateClick(clickedDate: Date) {
    if (!draftStart || draftEnd) {
      setDraftStart(clickedDate);
      setDraftEnd(null);
      setHoverDate(null);
      return;
    }
    if (clickedDate.getTime() < draftStart.getTime()) {
      setDraftEnd(draftStart);
      setDraftStart(clickedDate);
      setHoverDate(null);
      return;
    }
    if (isSameDay(clickedDate, draftStart)) {
      setDraftEnd(clickedDate);
      setHoverDate(null);
      return;
    }
    setDraftEnd(clickedDate);
    setHoverDate(null);
  }

  const visualRange = useMemo(() => {
    if (!draftStart) return { start: null, end: null };
    const endCandidate = draftEnd ?? hoverDate;
    if (!endCandidate) return { start: draftStart, end: null };
    return endCandidate.getTime() >= draftStart.getTime()
      ? { start: draftStart, end: endCandidate }
      : { start: endCandidate, end: draftStart };
  }, [draftStart, draftEnd, hoverDate]);

  const selectedDays = rangeDays(visualRange.start, visualRange.end);
  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left outline-none transition-all hover:border-primary/50"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate text-sm font-bold">
                {formatRange(start, end) || "Selecione o período"}
              </span>
            </span>
            {(start || end) && (
              <X 
                className="h-4 w-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null, null);
                }}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="bottom" 
          sideOffset={8}
          className="w-[340px] p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl z-[100]" 
          align="start"
        >
          <div className="h-8 mb-3 flex justify-center items-center">
            {selectedDays > 0 ? (
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 animate-in fade-in zoom-in-95 duration-200">
                {selectedDays} {selectedDays === 1 ? "dia selecionado" : "dias selecionados"}
              </span>
            ) : null}
          </div>
 
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-bold capitalize text-zinc-800 dark:text-zinc-100">
              {format(monthCursor, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <button
              type="button"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
 
          <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
            {weekDays.map((day, i) => (
              <div key={`${day}-${i}`} className="py-1 text-center text-[10px] font-black uppercase text-zinc-400">
                {day}
              </div>
            ))}
            {calendarDays.map(({ date, currentMonth }) => {
              const isStart = draftStart ? isSameDay(date, draftStart) : false;
              const isHoverEnd = !draftEnd && hoverDate ? isSameDay(date, hoverDate) : false;
              const isEnd = draftEnd ? isSameDay(date, draftEnd) : isHoverEnd;
              const isToday = isSameDay(date, today);
              const inRange =
                visualRange.start && visualRange.end
                  ? date.getTime() >= startOfDay(visualRange.start).getTime() && date.getTime() <= startOfDay(visualRange.end).getTime()
                  : false;
 
              const mutedClass = currentMonth 
                ? "text-zinc-700 dark:text-zinc-100" 
                : "text-zinc-400 dark:text-zinc-500";
              const rangeClass = inRange && !isStart && !isEnd ? "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400" : "";
              const todayClass = isToday && !isStart && !isEnd && !inRange
                ? "border-2 border-sky-500 text-sky-500"
                : "";
              const edgeClass = isStart || isEnd
                ? "bg-sky-500 text-white dark:text-white rounded-full shadow-md"
                : "rounded-full hover:bg-sky-500/10 dark:hover:bg-sky-500/20 hover:text-sky-600 dark:hover:text-sky-400 transition-none";
 
              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => handleDateClick(startOfDay(date))}
                  onMouseEnter={() => {
                    if (draftStart && !draftEnd) setHoverDate(startOfDay(date));
                  }}
                  className={cn(
                    "h-9 w-9 text-sm font-bold flex items-center justify-center transition-none group relative z-10",
                    mutedClass,
                    rangeClass,
                    todayClass,
                    edgeClass
                  )}
                >
                  <span className="relative z-20">
                    {date.getDate().toString().padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
 
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-white/10 pt-3">
            <button
              onClick={() => {
                setDraftStart(null);
                setDraftEnd(null);
                onChange(null, null);
                setOpen(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={() => {
                if (draftStart && !draftEnd) {
                  onChange(draftStart, draftStart);
                } else {
                  onChange(draftStart, draftEnd);
                }
                setOpen(false);
              }}
              className="bg-sky-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Aplicar
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
