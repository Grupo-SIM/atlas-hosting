"use client";

import { Check, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { CloudflareDnsRecord } from "@/lib/server/apis/cloudflare";
import { completeCloudflareScanReview } from "./actions";

export function DnsScanReview({
  domainId,
  embedded = false,
  onComplete,
  records,
}: {
  domainId: string;
  embedded?: boolean;
  onComplete?: () => void;
  records: CloudflareDnsRecord[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(
    () => new Set(records.map(record => record.id))
  );
  useEffect(() => {
    setSelected(new Set(records.map(record => record.id)));
  }, [records]);
  const finish = () =>
    startTransition(async () => {
      const result = await completeCloudflareScanReview(domainId, [
        ...selected,
      ]);
      if (result.success) {
        toast.success(result.message);
        onComplete?.();
      } else toast.error(result.message);
      router.refresh();
    });

  const content = (
    <div className="space-y-4">
      {embedded && (
        <p className="text-muted-foreground text-sm">
          A varredura consulta apenas nomes comuns. Adicione manualmente
          qualquer entrada ausente antes de continuar.
        </p>
      )}
      {records.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum registro apareceu até agora. A busca pode ainda estar em
            andamento.
          </p>
          <Button
            className="mt-3"
            onClick={() => router.refresh()}
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Atualizar busca
          </Button>
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-2">
          {records.map(record => (
            <label
              className="flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-muted/50"
              htmlFor={`${domainId}-${record.id}`}
              key={record.id}
            >
              <Checkbox
                checked={selected.has(record.id)}
                id={`${domainId}-${record.id}`}
                onCheckedChange={checked => {
                  const next = new Set(selected);
                  if (checked) next.add(record.id);
                  else next.delete(record.id);
                  setSelected(next);
                }}
              />
              <Badge variant="outline">{record.type}</Badge>
              <span className="min-w-0 flex-1 text-sm">
                <strong>{record.name}</strong>
                <span className="block break-all text-muted-foreground">
                  {record.content}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        <Button
          disabled={records.length === 0}
          onClick={() => setSelected(new Set(records.map(record => record.id)))}
          variant="ghost"
        >
          Selecionar todos
        </Button>
        <Button disabled={pending} onClick={finish}>
          <Check className="mr-2 h-4 w-4" />
          {pending
            ? "Importando..."
            : records.length
              ? `Importar ${selected.size} registros`
              : "Continuar sem registros"}
        </Button>
      </div>
    </div>
  );

  if (embedded) return content;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revise os registros encontrados</CardTitle>
        <CardDescription>
          A varredura consulta apenas nomes comuns. Confirme os registros abaixo
          e adicione manualmente qualquer entrada ausente antes de trocar os
          nameservers.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
