"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type Props<T> = {
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
};

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-white/40 dark:border-white/10">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-5">
          <div className="flex justify-center">
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-zinc-200/50 dark:bg-white/10" style={{ animationDuration: "2s" }} />
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
      <div className="flex-1 overflow-auto w-full">
        <table className={cn("w-full", minWidth)}>
          <thead>
            <tr className="sticky top-0 z-10 border-b border-white/40 bg-zinc-50/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-950/80">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-6 py-5 text-center text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
                    c.headerClassName
                  )}
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
                  key={idx}
                  className={cn(
                    "group transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-zinc-950/5 dark:hover:bg-white/5" : ""
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-6 py-5 text-center text-sm", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4">
                  <div className="flex flex-col items-center justify-center gap-2 text-center h-[400px]">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{emptyTitle}</div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">{emptyDescription}</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/40 bg-zinc-50/50 px-8 py-5 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Página <span className="font-bold text-zinc-900 dark:text-zinc-100">{page}</span> de{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalPages}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              "flex h-10 items-center justify-center rounded-xl border px-5 text-sm font-bold transition-all duration-200",
              canPrev
                ? "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                : "cursor-not-allowed opacity-30 border-zinc-100 text-zinc-300 dark:border-white/5 dark:text-zinc-600"
            )}
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              "flex h-10 items-center justify-center rounded-xl border px-5 text-sm font-bold transition-all duration-200",
              canNext
                ? "border-zinc-200 bg-white text-zinc-700 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                : "cursor-not-allowed opacity-30 border-zinc-100 text-zinc-300 dark:border-white/5 dark:text-zinc-600"
            )}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
