"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SimpayCalendar } from "@/app/(auth)/billing/_/simpay-calendar";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [start, setStart] = React.useState<Date | null>(new Date(2024, 0, 20));
  const [end, setEnd] = React.useState<Date | null>(new Date(2024, 1, 9));

  return (
    <div className={className}>
      <SimpayCalendar
        label=""
        start={start}
        end={end}
        onChange={(newStart, newEnd) => {
          setStart(newStart);
          setEnd(newEnd);
        }}
      />
    </div>
  );
}
