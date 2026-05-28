import { getVpsMetricsAction } from "@/app/vps-actions";
import { db } from "@/lib/db";
import { pgVpsServers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import VpsMetricsCharts from "@/components/vps/VpsMetricsCharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Server, Activity, HardDrive, Cpu, Database } from "lucide-react";
import Link from "next/link";

export default async function VpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: vpsId } = await params;

  const vps = await db.query.pgVpsServers.findFirst({
    where: eq(pgVpsServers.id, vpsId),
  });

  if (!vps) notFound();

  const metrics = await getVpsMetricsAction(vpsId);

  // Métrica mais recente para os cards de destaque
  const latest = metrics[0] || { cpuUsage: 0, ramUsage: 0, diskUsage: 0, uptime: "Desconhecido" };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex items-center gap-4">
        <Link href="/manage/vps">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{vps.name}</h2>
            <Badge variant={vps.status === "active" ? "action" : "secondary"}>
              {vps.status === "active" ? "Online" : "Aguardando Bot"}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">{vps.ip}</p>
        </div>
      </div>

      {/* Cards de métricas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Uso de CPU" 
          value={`${Math.round(latest.cpuUsage)}%`} 
          icon={<Cpu className="h-4 w-4 text-blue-500" />}
          description="Consumo atual do processador"
        />
        <MetricCard 
          title="Uso de RAM" 
          value={`${Math.round(latest.ramUsage)}%`} 
          icon={<Activity className="h-4 w-4 text-purple-500" />}
          description="Memória em uso pelo sistema"
        />
        <MetricCard 
          title="Uso de Disco" 
          value={`${Math.round(latest.diskUsage)}%`} 
          icon={<HardDrive className="h-4 w-4 text-emerald-500" />}
          description="Espaço ocupado no armazenamento"
        />
         <MetricCard 
          title="Uptime" 
          value={latest.uptime || "Iniciando..."} 
          icon={<Database className="h-4 w-4 text-orange-500" />}
          description="Tempo desde o último boot"
        />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Gráficos de Performance (Últimas Leituras)</h3>
        <VpsMetricsCharts data={metrics} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
