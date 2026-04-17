import React from "react";
import { Terminal, Loader2 } from "lucide-react";

interface Process {
  pid: number;
  name: string;
  user: string;
  threads: number;
  cpu: number;
  mem_abs: string;
  ram: number;
}

export default function VpsProcessTerminal({ processes }: { processes: Process[] | null }) {
  if (!processes || processes.length === 0) {
    return (
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-2xl min-h-[300px] flex flex-col">
          <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Terminal className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Connecting...</span>
          </div>
          <div className="p-8 flex flex-col items-center justify-center flex-1 gap-4 text-slate-400 font-mono text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span className="animate-pulse tracking-widest text-emerald-600 dark:text-emerald-500 font-bold">SINCRONIZANDO COM A VM...</span>
            <div className="space-y-1 w-full max-w-[200px]">
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-2xl min-h-[400px] flex flex-col uppercase">
      {/* Header do Terminal Estilo BPYTOP */}
      <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="h-3 w-3 text-emerald-500" />
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Process Monitor</span>
        </div>
        <div className="flex gap-3 text-[9px] font-mono text-slate-400 italic">
          <span>Sort: CPU%</span>
          <span>View: Detailed</span>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="p-2 overflow-x-auto flex-1">
        <table className="w-full font-mono text-[10px] text-left border-separate border-spacing-y-0.5">
          <thead>
            <tr className="text-slate-400 bg-slate-100/50 dark:bg-white/5 font-bold">
              <th className="p-1 pl-2">PID</th>
              <th className="p-1">PROGRAM</th>
              <th className="p-1 text-center">TR</th>
              <th className="p-1">USER</th>
              <th className="p-1 text-right">MEMB</th>
              <th className="p-1 pr-2 text-right">CPU%</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc, idx) => (
              <tr key={`${proc.pid}-${idx}`} className="group hover:bg-emerald-500/10 transition-colors">
                <td className="p-1 pl-2 text-slate-400">{proc.pid}</td>
                <td className="p-1 text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[130px]">{proc.name}</td>
                <td className="p-1 text-center text-slate-500">{proc.threads}</td>
                <td className="p-1 text-sky-600 dark:text-sky-400">{proc.user}</td>
                <td className="p-1 text-right text-yellow-600 dark:text-yellow-400 font-medium">{proc.mem_abs}</td>
                <td className="p-1 pr-2 text-right">
                  <span className={proc.cpu > 50 ? "text-red-500 font-bold" : "font-bold text-slate-700 dark:text-slate-300"}>
                    {proc.cpu.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-1.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center mt-auto">
        <span className="text-[px] font-mono text-slate-400">ATLAS COMMAND CENTER V2</span>
        <div className="flex items-center gap-1.5 font-bold">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 animate-pulse uppercase tracking-tight">Live Tracker</span>
        </div>
      </div>
    </div>
  );
}
