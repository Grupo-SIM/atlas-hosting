import { Loader2, Terminal } from "lucide-react";

interface Process {
  pid: number;
  name: string;
  user?: string;
  threads?: number;
  cpu: number;
  mem_abs: string;
  ram?: number;
}

export default function VpsProcessTerminal({
  processes,
}: {
  processes: Process[] | null;
}) {
  if (!processes || processes.length === 0) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-2xl">
        <div className="flex items-center gap-2 border-slate-200 border-b bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
          <Terminal className="h-3 w-3 text-slate-400" />
          <span className="font-bold font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            Conectando...
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white font-mono shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-2xl">
      <div className="flex items-center gap-2 border-slate-200 border-b bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <Terminal className="h-3 w-3 text-slate-400" />
        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
          Monitor de Processos
        </span>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 flex-1 overflow-auto overflow-x-hidden">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-slate-50 font-bold text-[9px] text-slate-400 uppercase tracking-wider dark:bg-slate-900">
            <tr>
              <th className="w-16 border-slate-200/50 border-r px-4 py-2 dark:border-slate-800/50">
                PID
              </th>
              <th className="border-slate-200/50 border-r px-4 py-2 dark:border-slate-800/50">
                Programa
              </th>
              <th className="w-24 border-slate-200/50 border-r px-4 py-2 text-right dark:border-slate-800/50">
                Mem
              </th>
              <th className="w-20 px-4 py-2 text-right">CPU%</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {processes.map((proc, idx) => (
              <tr
                className="group border-slate-100 border-b transition-colors hover:bg-slate-50/50 dark:border-slate-900/50 dark:hover:bg-emerald-500/5"
                key={`${proc.pid}-${idx}`}
              >
                <td className="border-slate-100 border-r px-4 py-1.5 text-slate-500 dark:border-slate-900/50 dark:text-slate-600">
                  {proc.pid}
                </td>
                <td className="max-w-[200px] truncate border-slate-100 border-r px-4 py-1.5 font-bold text-emerald-600 group-hover:text-emerald-500 dark:border-slate-900/50 dark:text-emerald-500">
                  {proc.name}
                </td>
                <td className="border-slate-100 border-r px-4 py-1.5 text-right text-orange-600 dark:border-slate-900/50 dark:text-orange-500/80">
                  {proc.mem_abs}
                </td>
                <td className="px-4 py-1.5 text-right font-bold text-slate-900 dark:text-slate-300">
                  {proc.cpu.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 border-slate-200 border-t bg-slate-50 px-4 py-1.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        <span className="font-bold text-[9px] text-emerald-600 uppercase tracking-widest dark:text-emerald-500">
          Processos em Tempo Real
        </span>
      </div>
    </div>
  );
}
