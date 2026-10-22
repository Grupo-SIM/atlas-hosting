import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { readContaboOverview } from "@/lib/server/suppliers/readers";

export async function ContaboOverview() {
  const result = await readContaboOverview();
  return <Card><CardHeader><CardTitle>Contabo</CardTitle></CardHeader><CardContent>
    <p className="mb-4 text-muted-foreground text-sm">A API integrada oferece inventário VPS; consulta de saldo financeiro não está disponível.</p>
    {result.state === "unconfigured" ? <p>Configuração incompleta no servidor. Configure credenciais Contabo.</p> : <>
      <p className="mb-4">Credenciais configuradas no servidor.</p>
      {result.state === "error" ? <p role="alert" className="text-destructive">{result.message}</p> : result.data.length === 0 ? <p>Nenhuma VPS encontrada no fornecedor.</p> : <ScrollArea className="h-96"><ul className="space-y-3">{result.data.map(instance => <li className="rounded-lg border p-3" key={instance.id}>
        <p className="font-semibold">{instance.name}</p><p className="text-muted-foreground text-sm">ID {instance.id} · {instance.region} · {instance.ipv4 || "IP ainda não atribuído"}</p>
        <p className="text-sm">Estado: {({ running: "Em execução", stopped: "Parada", provisioning: "Em provisionamento" } as Record<string, string>)[instance.status] || "Estado do fornecedor não reconhecido"}</p>
      </li>)}</ul></ScrollArea>}
    </>}
  </CardContent></Card>;
}
