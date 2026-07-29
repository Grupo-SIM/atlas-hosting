import { Activity, Cpu, Database, HardDrive, Server } from "lucide-react";
import { getUserVpsServers, getVpsMetricsAction } from "@/app/vps-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VpsMetricsCharts from "@/components/vps/VpsMetricsCharts";
import VpsProcessTerminal from "@/components/vps/VpsProcessTerminal";
import VpsRefreshButton from "@/components/vps/VpsRefreshButton";
import VpsServerSelector from "@/components/vps/VpsServerSelector";
import VpsSystemDetails from "@/components/vps/VpsSystemDetails";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VpsDashboardPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const servers = await getUserVpsServers();

  if (servers.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
        <h2 className="font-bold text-3xl tracking-tight">Hospedagem VPS</h2>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Server className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-xl">Nenhum servidor encontrado</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Você ainda não possui servidores ativos vinculados à sua conta.
          </p>
        </Card>
      </div>
    );
  }

  // Seleciona o servidor atual (ou o primeiro da lista)
  const currentServerId = searchParams.id || servers[0].id;
  const currentServer =
    servers.find(s => s.id === currentServerId) || servers[0];

  // Busca métricas do servidor selecionado
  const metrics = await getVpsMetricsAction(currentServer.id);
  const latest = metrics[0] || {
    cpuUsage: 0,
    diskUsage: 0,
    ramUsage: 0,
    uptime: "Desconhecido",
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">
            Monitoramento Real-time
          </h2>
          <p className="text-muted-foreground">
            Acompanhe a performance dos seus servidores Atlas.
          </p>
        </div>

        {/* Dropdown de Seleção de VPS & Botão Atualizar */}
        <div className="flex items-center gap-2">
          <VpsRefreshButton serverId={currentServer.id} />
          <div className="mx-2 hidden h-8 w-[1px] bg-slate-200 md:block dark:bg-slate-800" />
          <span className="hidden font-medium text-muted-foreground text-sm sm:inline">
            Servidor:
          </span>
          <VpsServerSelector currentId={currentServer.id} servers={servers} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xl">{currentServer.name}</h3>
            <Badge
              variant={
                currentServer.status === "active" ? "action" : "secondary"
              }
            >
              {currentServer.status === "active" ? "Online" : "Aguardando bot"}
            </Badge>
          </div>
          <p className="font-mono text-muted-foreground text-sm">
            {currentServer.ip}
          </p>
        </div>
      </div>

      {/* Cards de métricas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          description="Consumo instantâneo"
          icon={<Cpu className="h-4 w-4 text-blue-500" />}
          title="Uso de CPU"
          value={`${Math.round(latest.cpuUsage)}%`}
        />
        <MetricCard
          description="Memória do sistema"
          icon={<Activity className="h-4 w-4 text-purple-500" />}
          title="Uso de RAM"
          value={`${Math.round(latest.ramUsage)}%`}
        />
        <MetricCard
          description="Armazenamento root"
          icon={<HardDrive className="h-4 w-4 text-emerald-500" />}
          title="Uso de Disco"
          value={`${Math.round(latest.diskUsage)}%`}
        />
        <MetricCard
          description="Tempo desde o boot"
          icon={<Database className="h-4 w-4 text-orange-500" />}
          title="Uptime"
          value={latest.uptime || "---"}
        />
      </div>

      {/* NEW: Gráfico de detalhes estilo BPYTOP */}
      <VpsSystemDetails metadata={(currentServer as any).metadata || {}} />

      <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-lg">Histórico de Performance</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Atualizado a cada 60s
            </div>
          </div>
          <VpsMetricsCharts data={metrics} />
        </div>

        <div className="flex flex-col lg:col-span-1">
          <div className="mb-2 flex h-[28px] items-center gap-2">
            <h3 className="font-medium text-lg">Processos Ativos</h3>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          </div>
          <div className="h-[615px]">
            <VpsProcessTerminal processes={currentServer.topProcesses} />
          </div>
        </div>
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
    <Card className="border-2 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl tracking-tight">{value}</div>
        <p className="mt-1 text-[10px] text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
