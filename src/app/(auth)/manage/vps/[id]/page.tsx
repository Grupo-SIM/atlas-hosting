import { eq } from "drizzle-orm";
import { Activity, ChevronLeft, Cpu, Database, HardDrive } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVpsMetricsAction } from "@/app/vps-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VpsMetricsCharts from "@/components/vps/VpsMetricsCharts";
import { db } from "@/lib/db";
import { pgVpsServers } from "@/lib/db/schema";

export default async function VpsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: vpsId } = await params;

  const vps = await db.query.pgVpsServers.findFirst({
    where: eq(pgVpsServers.id, vpsId),
  });

  if (!vps) notFound();

  const metrics = await getVpsMetricsAction(vpsId);

  // Métrica mais recente para os cards de destaque
  const latest = metrics[0] || {
    cpuUsage: 0,
    diskUsage: 0,
    ramUsage: 0,
    uptime: "Desconhecido",
  };

  return (
    <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
      <div className="flex items-center gap-4">
        <Link href="/manage/vps">
          <Button size="icon" variant="ghost">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-3xl tracking-tight">{vps.name}</h2>
            <Badge variant={vps.status === "active" ? "action" : "secondary"}>
              {vps.status === "active" ? "Online" : "Aguardando Bot"}
            </Badge>
          </div>
          <p className="font-mono text-muted-foreground">{vps.ip}</p>
        </div>
      </div>

      {/* Cards de métricas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="Consumo atual do processador"
          icon={<Cpu className="h-4 w-4 text-blue-500" />}
          title="Uso de CPU"
          value={`${Math.round(latest.cpuUsage)}%`}
        />
        <MetricCard
          description="Memória em uso pelo sistema"
          icon={<Activity className="h-4 w-4 text-purple-500" />}
          title="Uso de RAM"
          value={`${Math.round(latest.ramUsage)}%`}
        />
        <MetricCard
          description="Espaço ocupado no armazenamento"
          icon={<HardDrive className="h-4 w-4 text-emerald-500" />}
          title="Uso de Disco"
          value={`${Math.round(latest.diskUsage)}%`}
        />
        <MetricCard
          description="Tempo desde o último boot"
          icon={<Database className="h-4 w-4 text-orange-500" />}
          title="Uptime"
          value={latest.uptime || "Iniciando..."}
        />
      </div>

      <div className="mt-6">
        <h3 className="mb-4 font-medium text-lg">
          Gráficos de Performance (Últimas Leituras)
        </h3>
        <VpsMetricsCharts data={metrics} />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        <p className="mt-1 text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
