"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface Props<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  minWidth?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-white/40 border-b dark:border-white/10">
      {Array.from({ length: cols }).map((_, i) => (
        <td className="px-4 py-5" key={i}>
          <div className="flex justify-center">
            <div
              className="h-4 w-3/4 animate-pulse rounded-md bg-zinc-200/50 dark:bg-white/10"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  emptyTitle = "Nenhum resultado",
  emptyDescription = "Tente ajustar os filtros e pesquisar novamente.",
  onRowClick,
  page,
  pageSize,
  total,
  onPageChange,
  minWidth = "min-w-[800px]",
}: Props<T>) {
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / (pageSize || 1)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/40 bg-zinc-50/50 shadow-[0_12px_44px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <div className="w-full flex-1 overflow-auto">
        <table className={cn("w-full", minWidth)}>
          <thead>
            <tr className="sticky top-0 z-10 border-white/40 border-b bg-zinc-50/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/80">
              {columns.map(c => (
                <th
                  className={cn(
                    "px-6 py-5 text-center font-black text-[11px] text-zinc-500 uppercase tracking-wider dark:text-zinc-400",
                    c.headerClassName
                  )}
                  key={c.key}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 dark:divide-white/10">
            {loading ? (
              <>
                <SkeletonRow cols={columns.length} />
                <SkeletonRow cols={columns.length} />
                <SkeletonRow cols={columns.length} />
                <SkeletonRow cols={columns.length} />
              </>
            ) : rows.length ? (
              rows.map((row, idx) => (
                <tr
                  className={cn(
                    "group transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-zinc-950/5 dark:hover:bg-white/5"
                      : ""
                  )}
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(c => (
                    <td
                      className={cn(
                        "px-6 py-5 text-center text-sm",
                        c.className
                      )}
                      key={c.key}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4" colSpan={columns.length}>
                  <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-center">
                    <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {emptyTitle}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {emptyDescription}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-white/40 border-t bg-zinc-50/50 px-8 py-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Página{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {page}
          </span>{" "}
          de{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {totalPages}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={cn(
              "flex h-10 items-center justify-center rounded-xl border px-5 font-bold text-sm transition-all duration-200",
              canPrev
                ? "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                : "cursor-not-allowed border-zinc-100 text-zinc-300 opacity-30 dark:border-white/5 dark:text-zinc-600"
            )}
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            Anterior
          </button>
          <button
            className={cn(
              "flex h-10 items-center justify-center rounded-xl border px-5 font-bold text-sm transition-all duration-200",
              canNext
                ? "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                : "cursor-not-allowed border-zinc-100 text-zinc-300 opacity-30 dark:border-white/5 dark:text-zinc-600"
            )}
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
