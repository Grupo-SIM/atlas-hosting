import React from "react";
import { Terminal, Loader2 } from "lucide-react";

interface Process {
  pid: number;
  name: string;
  user?: string;
  threads?: number;
  cpu: number;
  mem_abs: string;
  ram?: number;
}

export default function VpsProcessTerminal({ processes }: { processes: Process[] | null }) {
  if (!processes || processes.length === 0) {
    return (
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-2xl h-full flex flex-col">
        <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Terminal className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Conectando...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-2xl h-full flex flex-col font-mono">
      <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Terminal className="h-3 w-3 text-slate-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Monitor de Processos</span>
      </div>

      <div className="flex-1 overflow-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 text-[9px] text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="px-4 py-2 border-r border-slate-200/50 dark:border-slate-800/50 w-16">PID</th>
              <th className="px-4 py-2 border-r border-slate-200/50 dark:border-slate-800/50">Programa</th>
              <th className="px-4 py-2 text-right border-r border-slate-200/50 dark:border-slate-800/50 w-24">Mem</th>
              <th className="px-4 py-2 text-right w-20">CPU%</th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {processes.map((proc, idx) => (
              <tr 
                key={`${proc.pid}-${idx}`} 
                className="border-b border-slate-100 dark:border-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-emerald-500/5 transition-colors group"
              >
                <td className="px-4 py-1.5 text-slate-500 dark:text-slate-600 border-r border-slate-100 dark:border-slate-900/50">{proc.pid}</td>
                <td className="px-4 py-1.5 font-bold text-emerald-600 dark:text-emerald-500 truncate max-w-[200px] border-r border-slate-100 dark:border-slate-900/50 group-hover:text-emerald-500">
                  {proc.name}
                </td>
                <td className="px-4 py-1.5 text-right text-orange-600 dark:text-orange-500/80 border-r border-slate-100 dark:border-slate-900/50">
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

      <div className="bg-slate-50 dark:bg-slate-900 px-4 py-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 uppercase tracking-widest font-bold">Processos em Tempo Real</span>
      </div>
    </div>
  );
}
