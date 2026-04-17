"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Database, HardDrive, BarChart3 } from "lucide-react";

interface VpsSystemDetailsProps {
  metadata: any;
}

export default function VpsSystemDetails({ metadata: rawMetadata }: VpsSystemDetailsProps) {
  // Garantimos que o metadata seja um objeto válido
  let metadata = rawMetadata;
  if (typeof rawMetadata === "string") {
    try {
      metadata = JSON.parse(rawMetadata);
    } catch (e) {
      metadata = {};
    }
  }

  if (!metadata || !metadata.ram_details) {
    return (
        <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-mono mb-8">
            Aguardando métricas detalhadas do bot v7...
        </div>
    );
  }

  const { cpu_cores = [], ram_details = {}, disks_details = [], load_avg = [0,0,0] } = metadata;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 uppercase font-mono text-xs">
      {/* CPU Cores Box */}
      <Card className="bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
        <CardHeader className="py-2 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center gap-2">
            <Cpu className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] tracking-widest font-bold text-emerald-600 dark:text-emerald-500">NÚCLEOS DE CPU & CARGA</span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {cpu_cores && cpu_cores.map((usage: number, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-slate-500">C{i+1}:</span>
                <span className={usage > 70 ? 'text-red-500 font-bold' : usage > 40 ? 'text-yellow-500' : 'text-emerald-500'}>
                    {usage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span>MÉDIA DE CARGA:</span>
                <span className="text-slate-900 dark:text-white">{load_avg?.map((l: number) => l.toFixed(2)).join(" ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Details Box */}
      <Card className="bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
        <CardHeader className="py-2 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center gap-2">
            <Database className="h-3 w-3 text-purple-500" />
            <span className="text-[10px] tracking-widest font-bold text-purple-600 dark:text-purple-500">DETALHES DE MEMÓRIA</span>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400 dark:text-slate-500">TOTAL:</span>
                <span className="text-slate-900 dark:text-white font-bold">{ram_details?.total}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400 dark:text-slate-500">USADA:</span>
                <span className="text-red-500 dark:text-red-400 font-bold">{ram_details?.used}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400 dark:text-slate-500">DISPONÍVEL:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{ram_details?.available}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400 dark:text-slate-500">EM CACHE:</span>
                <span className="text-sky-600 dark:text-sky-400">{ram_details?.cached}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">LIVRE:</span>
                <span className="text-emerald-500">{ram_details?.free}</span>
            </div>
        </CardContent>
      </Card>

      {/* Disks Details Box */}
      <Card className="bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none">
        <CardHeader className="py-2 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center gap-2">
            <HardDrive className="h-3 w-3 text-sky-500" />
            <span className="text-[10px] tracking-widest font-bold text-sky-600 dark:text-sky-500">PARTIÇÕES DE DISCO</span>
        </CardHeader>
        <CardContent className="p-4 min-h-[160px] overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-slate-800">
          <div className="space-y-3">
            {disks_details && disks_details.map((disk: any, i: number) => (
              <div key={i} className="flex flex-col gap-1 border-b border-slate-50 dark:border-slate-900 pb-2 last:border-0 font-mono">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-sky-600 dark:text-sky-500 font-bold">{disk.mount}</span>
                  <span className="text-slate-400 dark:text-slate-500">{disk.used} / {disk.total}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${disk.percent > 90 ? 'bg-red-500' : disk.percent > 70 ? 'bg-yellow-500' : 'bg-sky-500'}`}
                     style={{ width: `${disk.percent}%` }}
                   />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
