"use client";

import { Cpu, Database, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface VpsSystemDetailsProps {
  metadata: any;
}

export default function VpsSystemDetails({
  metadata: rawMetadata,
}: VpsSystemDetailsProps) {
  // Garantimos que o metadata seja um objeto válido
  let metadata = rawMetadata;
  if (typeof rawMetadata === "string") {
    try {
      metadata = JSON.parse(rawMetadata);
    } catch (e) {
      metadata = {};
    }
  }

  if (!metadata?.ram_details) {
    return (
      <div className="mb-8 rounded-lg border-2 border-slate-200 border-dashed p-4 text-center font-mono text-slate-400 text-xs uppercase tracking-widest dark:border-slate-800 dark:text-slate-500">
        Aguardando métricas detalhadas do bot v7...
      </div>
    );
  }

  const {
    cpu_cores = [],
    ram_details = {},
    disks_details = [],
    load_avg = [0, 0, 0],
  } = metadata;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 font-mono text-xs uppercase md:grid-cols-3">
      {/* CPU Cores Box */}
      <Card className="border-2 border-slate-100 bg-white text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 border-slate-50 border-b py-2 dark:border-slate-800">
          <Cpu className="h-3 w-3 text-emerald-500" />
          <span className="font-bold text-[10px] text-emerald-600 tracking-widest dark:text-emerald-500">
            NÚCLEOS DE CPU & CARGA
          </span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {cpu_cores?.map((usage: number, i: number) => (
              <div className="flex items-center justify-between" key={i}>
                <span className="text-slate-500">C{i + 1}:</span>
                <span
                  className={
                    usage > 70
                      ? "font-bold text-red-500"
                      : usage > 40
                        ? "text-yellow-500"
                        : "text-emerald-500"
                  }
                >
                  {usage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto border-slate-100 border-t pt-3 dark:border-slate-800">
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>MÉDIA DE CARGA:</span>
              <span className="text-slate-900 dark:text-white">
                {load_avg?.map((l: number) => l.toFixed(2)).join(" ")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Details Box */}
      <Card className="border-2 border-slate-100 bg-white text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 border-slate-50 border-b py-2 dark:border-slate-800">
          <Database className="h-3 w-3 text-purple-500" />
          <span className="font-bold text-[10px] text-purple-600 tracking-widest dark:text-purple-500">
            DETALHES DE MEMÓRIA
          </span>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          <div className="flex justify-between border-slate-50 border-b pb-1 dark:border-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500">TOTAL:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {ram_details?.total}
            </span>
          </div>
          <div className="flex justify-between border-slate-50 border-b pb-1 dark:border-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500">USADA:</span>
            <span className="font-bold text-red-500 dark:text-red-400">
              {ram_details?.used}
            </span>
          </div>
          <div className="flex justify-between border-slate-50 border-b pb-1 dark:border-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500">
              DISPONÍVEL:
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {ram_details?.available}
            </span>
          </div>
          <div className="flex justify-between border-slate-50 border-b pb-1 dark:border-slate-800/50">
            <span className="text-slate-400 dark:text-slate-500">
              EM CACHE:
            </span>
            <span className="text-sky-600 dark:text-sky-400">
              {ram_details?.cached}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-500">LIVRE:</span>
            <span className="text-emerald-500">{ram_details?.free}</span>
          </div>
        </CardContent>
      </Card>

      {/* Disks Details Box */}
      <Card className="border-2 border-slate-100 bg-white text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:shadow-none">
        <CardHeader className="flex flex-row items-center gap-2 border-slate-50 border-b py-2 dark:border-slate-800">
          <HardDrive className="h-3 w-3 text-sky-500" />
          <span className="font-bold text-[10px] text-sky-600 tracking-widest dark:text-sky-500">
            PARTIÇÕES DE DISCO
          </span>
        </CardHeader>
        <CardContent className="scrollbar-thin scrollbar-thumb-slate-800 max-h-[220px] min-h-[160px] overflow-y-auto p-4">
          <div className="space-y-3">
            {disks_details?.map((disk: any, i: number) => (
              <div
                className="flex flex-col gap-1 border-slate-50 border-b pb-2 font-mono last:border-0 dark:border-slate-900"
                key={i}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-sky-600 dark:text-sky-500">
                    {disk.mount}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {disk.used} / {disk.total}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                  <div
                    className={`h-full ${disk.percent > 90 ? "bg-red-500" : disk.percent > 70 ? "bg-yellow-500" : "bg-sky-500"}`}
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
