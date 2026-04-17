import { getUserVpsServers, getVpsMetricsAction } from "@/app/vps-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Activity, HardDrive, Cpu, Database } from "lucide-react";
import VpsMetricsCharts from "@/components/vps/VpsMetricsCharts";
import VpsServerSelector from "@/components/vps/VpsServerSelector";
import VpsProcessTerminal from "@/components/vps/VpsProcessTerminal";
import VpsSystemDetails from "@/components/vps/VpsSystemDetails";
import VpsRefreshButton from "@/components/vps/VpsRefreshButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VpsDashboardPage({
  searchParams: searchParamsPromise
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const searchParams = await searchParamsPromise;
  const servers = await getUserVpsServers();

  if (servers.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Hospedagem VPS</h2>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Server className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Nenhum servidor encontrado</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            Você ainda não possui servidores ativos vinculados à sua conta.
          </p>
        </Card>
      </div>
    );
  }

  // Seleciona o servidor atual (ou o primeiro da lista)
  const currentServerId = searchParams.id || servers[0].id;
  const currentServer = servers.find(s => s.id === currentServerId) || servers[0];

  // LOG DE DEPURAÇÃO (Visível no terminal local)
  console.log("SERVER DEBUG:", currentServer?.name, "PROCESSES:", currentServer?.topProcesses?.length || 0);

  // Busca métricas do servidor selecionado
  const metrics = await getVpsMetricsAction(currentServer.id);
  const latest = metrics[0] || { cpuUsage: 0, ramUsage: 0, diskUsage: 0, uptime: "Desconhecido" };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitoramento Real-time</h2>
          <p className="text-muted-foreground">
            Acompanhe a performance dos seus servidores Atlas.
          </p>
        </div>

        {/* Dropdown de Seleção de VPS & Botão Atualizar */}
        <div className="flex items-center gap-2">
          <VpsRefreshButton serverId={currentServer.id} />
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Servidor:</span>
          <VpsServerSelector servers={servers} currentId={currentServer.id} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{currentServer.name}</h3>
            <Badge variant={currentServer.status === "active" ? "action" : "secondary"}>
              {currentServer.status === "active" ? "Online" : "Aguardando bot"}
            </Badge>
          </div>
          <p className="text-sm font-mono text-muted-foreground">{currentServer.ip}</p>
        </div>
      </div>

      {/* Cards de métricas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Uso de CPU"
          value={`${Math.round(latest.cpuUsage)}%`}
          icon={<Cpu className="h-4 w-4 text-blue-500" />}
          description="Consumo instantâneo"
        />
        <MetricCard
          title="Uso de RAM"
          value={`${Math.round(latest.ramUsage)}%`}
          icon={<Activity className="h-4 w-4 text-purple-500" />}
          description="Memória do sistema"
        />
        <MetricCard
          title="Uso de Disco"
          value={`${Math.round(latest.diskUsage)}%`}
          icon={<HardDrive className="h-4 w-4 text-emerald-500" />}
          description="Armazenamento root"
        />
        <MetricCard
          title="Uptime"
          value={latest.uptime || "---"}
          icon={<Database className="h-4 w-4 text-orange-500" />}
          description="Tempo desde o boot"
        />
      </div>

      {/* NEW: Gráfico de detalhes estilo BPYTOP */}
      <VpsSystemDetails metadata={(currentServer as any).metadata || {}} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 items-stretch">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Histórico de Performance</h3>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Atualizado a cada 60s
            </div>
          </div>
          <VpsMetricsCharts data={metrics} />
        </div>

        <div className="lg:col-span-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 h-[28px]">
             <h3 className="text-lg font-medium">Processos Ativos</h3>
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="h-[615px]">
            <VpsProcessTerminal processes={currentServer.topProcesses} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
