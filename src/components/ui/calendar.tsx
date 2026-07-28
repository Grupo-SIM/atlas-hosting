"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        caption_label: "text-sm font-medium",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range-end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        month: "space-y-4 relative",
        month_caption: "flex justify-center pt-1 items-center",
        month_grid: "w-full border-collapse space-y-1",
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        nav: "flex items-center justify-between absolute inset-x-1 top-1 z-10",
        outside:
          "outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        range_end:
          "range-end bg-sky-500 text-white aria-selected:bg-sky-500 aria-selected:text-white hover:bg-sky-500 hover:text-white focus:bg-sky-500 focus:text-white",
        range_middle:
          "aria-selected:bg-sky-500/20 aria-selected:text-sky-500 hover:aria-selected:bg-sky-500/20 hover:aria-selected:text-sky-500",
        range_start:
          "range-start bg-sky-500 text-white aria-selected:bg-sky-500 aria-selected:text-white hover:bg-sky-500 hover:text-white focus:bg-sky-500 focus:text-white",
        selected:
          "bg-sky-500 text-white hover:bg-sky-500 hover:text-white focus:bg-sky-500 focus:text-white",
        today: "bg-accent text-accent-foreground",
        week: "flex w-full mt-2",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        weekdays: "flex",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
