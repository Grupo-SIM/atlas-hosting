import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDomainData } from "../../utils";
import { DomainBundleConfirmClient } from "./DomainBundleConfirmClient";

export async function DomainBundleSection({ domains }: { domains: string[] }) {
  const rows = await Promise.all(
    domains.map(async domain => {
      const data = await getDomainData(domain);
      const d = data?.domain;
      return {
        available: d?.available ?? false,
        domain,
        priceBRL: d?.priceBRL ?? 0,
        renewBRL: d?.renewBRL ?? 0,
      };
    })
  );

  const allAvailable = rows.every(r => r.available);
  const total = rows.reduce((acc, r) => acc + r.priceBRL, 0);

  return (
    <Card className="mx-auto max-w-3xl border-[#01FC8D]/25 bg-card/80">
      <CardHeader>
        <CardTitle>Pacote “Amplie sua marca”</CardTitle>
        <CardDescription>
          Confira os domínios e os valores estimados. O valor final da fatura é
          recalculado no servidor no momento da confirmação.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domínio</TableHead>
                <TableHead className="text-right">1º ano (estimado)</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Renovação
                </TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.domain}>
                  <TableCell className="font-medium">{r.domain}</TableCell>
                  <TableCell className="text-right">
                    {r.available
                      ? new Intl.NumberFormat("pt-BR", {
                          currency: "BRL",
                          style: "currency",
                        }).format(r.priceBRL)
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                    {r.available
                      ? new Intl.NumberFormat("pt-BR", {
                          currency: "BRL",
                          style: "currency",
                        }).format(r.renewBRL)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {r.available ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Disponível
                      </span>
                    ) : (
                      <span className="text-destructive">Indisponível</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t pt-4 sm:flex-row sm:items-center">
          <span className="text-muted-foreground text-sm">
            Total estimado (soma 1º ano)
          </span>
          <span className="font-semibold text-lg">
            {new Intl.NumberFormat("pt-BR", {
              currency: "BRL",
              style: "currency",
            }).format(total)}
          </span>
        </div>

        <DomainBundleConfirmClient disabled={!allAvailable} domains={domains} />
      </CardContent>
    </Card>
  );
}
