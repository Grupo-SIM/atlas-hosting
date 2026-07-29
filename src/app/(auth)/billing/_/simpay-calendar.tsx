"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Utils adapted from Simpay
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

interface Props {
  label: string;
  start: Date | null;
  end: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}

export function SimpayCalendar({ label, start, end, onChange }: Props) {
  const today = startOfDay(new Date());

  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(
    new Date((end || today).getFullYear(), (end || today).getMonth(), 1)
  );
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
      days.push({
        currentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ currentMonth: true, date: new Date(year, month, day) });
    }
    while (days.length < 42) {
      const nextDay = days.length - (normalizedStart + daysInMonth) + 1;
      days.push({
        currentMonth: false,
        date: new Date(year, month + 1, nextDay),
      });
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
    if (!draftStart) return { end: null, start: null };
    const endCandidate = draftEnd ?? hoverDate;
    if (!endCandidate) return { end: null, start: draftStart };
    return endCandidate.getTime() >= draftStart.getTime()
      ? { end: endCandidate, start: draftStart }
      : { end: draftStart, start: endCandidate };
  }, [draftStart, draftEnd, hoverDate]);

  const selectedDays = rangeDays(visualRange.start, visualRange.end);
  const weekDays = ["S", "T", "Q", "Q", "S", "S", "D"];

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="ml-1 font-black text-[10px] text-zinc-400 uppercase tracking-widest">
          {label}
        </span>
      )}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <button
            className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left outline-none transition-all hover:border-primary/50"
            type="button"
          >
            <span className="inline-flex items-center gap-2 truncate">
              <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate font-bold text-sm">
                {formatRange(start, end) || "Selecione o período"}
              </span>
            </span>
            {(start || end) && (
              <X
                className="h-4 w-4 text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                onClick={e => {
                  e.stopPropagation();
                  onChange(null, null);
                }}
              />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[100] w-[340px] rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-950"
          side="bottom"
          sideOffset={8}
        >
          <div className="mb-3 flex h-8 items-center justify-center">
            {selectedDays > 0 ? (
              <span className="fade-in zoom-in-95 animate-in rounded-full bg-sky-500/10 px-3 py-1 font-bold text-sky-400 text-xs duration-200">
                {selectedDays}{" "}
                {selectedDays === 1 ? "dia selecionado" : "dias selecionados"}
              </span>
            ) : null}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
              onClick={() =>
                setMonthCursor(
                  new Date(
                    monthCursor.getFullYear(),
                    monthCursor.getMonth() - 1,
                    1
                  )
                )
              }
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-bold text-sm text-zinc-800 capitalize dark:text-zinc-100">
              {format(monthCursor, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
              onClick={() =>
                setMonthCursor(
                  new Date(
                    monthCursor.getFullYear(),
                    monthCursor.getMonth() + 1,
                    1
                  )
                )
              }
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div
            className="grid grid-cols-7 gap-1"
            onMouseLeave={() => setHoverDate(null)}
          >
            {weekDays.map((day, i) => (
              <div
                className="py-1 text-center font-black text-[10px] text-zinc-400 uppercase"
                key={`${day}-${i}`}
              >
                {day}
              </div>
            ))}
            {calendarDays.map(({ date, currentMonth }) => {
              const isStart = draftStart ? isSameDay(date, draftStart) : false;
              const isHoverEnd =
                !draftEnd && hoverDate ? isSameDay(date, hoverDate) : false;
              const isEnd = draftEnd ? isSameDay(date, draftEnd) : isHoverEnd;
              const isToday = isSameDay(date, today);
              const inRange =
                visualRange.start && visualRange.end
                  ? date.getTime() >= startOfDay(visualRange.start).getTime() &&
                    date.getTime() <= startOfDay(visualRange.end).getTime()
                  : false;

              const mutedClass = currentMonth
                ? "text-zinc-700 dark:text-zinc-100"
                : "text-zinc-400 dark:text-zinc-500";
              const rangeClass =
                inRange && !isStart && !isEnd
                  ? "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400"
                  : "";
              const todayClass =
                isToday && !isStart && !isEnd && !inRange
                  ? "border-2 border-sky-500 text-sky-500"
                  : "";
              const edgeClass =
                isStart || isEnd
                  ? "bg-sky-500 text-white dark:text-white rounded-full shadow-md"
                  : "rounded-full hover:bg-sky-500/10 dark:hover:bg-sky-500/20 hover:text-sky-600 dark:hover:text-sky-400 transition-none";

              return (
                <button
                  className={cn(
                    "group relative z-10 flex h-9 w-9 items-center justify-center font-bold text-sm transition-none",
                    mutedClass,
                    rangeClass,
                    todayClass,
                    edgeClass
                  )}
                  key={date.toISOString()}
                  onClick={() => handleDateClick(startOfDay(date))}
                  onMouseEnter={() => {
                    if (draftStart && !draftEnd) setHoverDate(startOfDay(date));
                  }}
                  type="button"
                >
                  <span className="relative z-20">
                    {date.getDate().toString().padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-zinc-100 border-t pt-3 dark:border-white/10">
            <button
              className="px-3 py-1.5 font-bold text-xs text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
              onClick={() => {
                setDraftStart(null);
                setDraftEnd(null);
                onChange(null, null);
                setOpen(false);
              }}
            >
              Limpar
            </button>
            <button
              className="rounded-lg bg-sky-500 px-4 py-1.5 font-bold text-white text-xs shadow-sm transition-all hover:shadow-md active:scale-95"
              onClick={() => {
                if (draftStart && !draftEnd) {
                  onChange(draftStart, draftStart);
                } else {
                  onChange(draftStart, draftEnd);
                }
                setOpen(false);
              }}
            >
              Aplicar
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
