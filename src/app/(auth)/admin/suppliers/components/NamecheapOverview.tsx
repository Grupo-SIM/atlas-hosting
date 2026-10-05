import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readNamecheapOverview } from "@/lib/server/suppliers/readers";

export async function NamecheapOverview() {
  const result = await readNamecheapOverview();
  return <Card><CardHeader><CardTitle>Namecheap</CardTitle></CardHeader><CardContent>
    {result.state === "error" ? <p role="alert" className="text-destructive">{result.message}</p> : result.state === "unconfigured" ? <p>Fornecedor não configurado.</p> : <dl className="space-y-4">
      <div><dt className="text-muted-foreground">Saldo disponível</dt><dd className="font-semibold text-2xl">{result.data.currency} {result.data.available.toFixed(2)}</dd></div>
      <div><dt className="text-muted-foreground">Saldo total da conta</dt><dd>{result.data.currency} {result.data.total.toFixed(2)}</dd></div>
      <div><dt className="text-muted-foreground">Fundos necessários para renovação automática no fornecedor</dt><dd>{result.data.currency} {result.data.autoRenewRequired.toFixed(2)}</dd></div>
      <div><dt className="text-muted-foreground">Moeda</dt><dd>{result.data.currency}</dd></div>
    </dl>}
    <p className="mt-4 text-muted-foreground text-sm">Compras e renovações via API usam fundos da conta. Avisos operacionais de saldo baixo usam limite de USD 40; esta consulta não dispara avisos.</p>
  </CardContent></Card>;
}
