"use client";

import {
  AlertCircle,
  CheckCircle,
  Database,
  Download,
  Loader2,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { runDbQueryAction, type TableDataResult } from "../actions";

interface QueryEditorProps {
  instanceId: number;
  initialQuery?: string;
}

export function QueryEditor({
  instanceId,
  initialQuery = "",
}: QueryEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<TableDataResult | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      toast({
        description: "Por favor, insira uma consulta SQL.",
        title: "Consulta vazia",
        variant: "default",
      });
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResult(null);
    const startTime = Date.now();

    try {
      const queryResult = await runDbQueryAction(instanceId, query.trim(), {});
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setResult(queryResult);

      // Update URL to persist query
      const params = new URLSearchParams(searchParams);
      params.set("query", query.trim());
      router.push(`?${params.toString()}`);

      toast({
        description: `Consulta executada em ${endTime - startTime}ms`,
        title: "Consulta executada",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setExecutionTime(null);
      toast({
        description: errorMessage,
        title: "Erro na consulta",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  }, [instanceId, query, searchParams, router]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setResult(null);
    setError(null);
    setExecutionTime(null);

    // Clear URL parameter
    const params = new URLSearchParams(searchParams);
    params.delete("query");
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const saveQuery = useCallback(() => {
    // For now, just copy to clipboard
    navigator.clipboard
      .writeText(query)
      .then(() => {
        toast({
          description: "A consulta foi copiada para a área de transferência.",
          title: "Consulta copiada",
        });
      })
      .catch(() => {
        toast({
          description: "Não foi possível copiar a consulta.",
          title: "Erro ao copiar",
          variant: "destructive",
        });
      });
  }, [query]);

  const downloadResults = useCallback(() => {
    if (!result || typeof result === "string") return;

    try {
      // Convert result to CSV
      const csv = [
        // Header
        result.columns.map(col => col.name).join(","),
        // Rows
        ...result.rows.map(row =>
          result.columns
            .map(col => {
              const value = row[col.name];
              // Escape values that contain commas or quotes
              if (
                typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return String(value ?? "");
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `query_results_${Date.now()}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        description: "Os resultados foram baixados como CSV.",
        title: "Download iniciado",
      });
    } catch (err) {
      toast({
        description: "Não foi possível baixar os resultados.",
        title: "Erro no download",
        variant: "destructive",
      });
    }
  }, [result]);

  const renderResult = useCallback(() => {
    if (!result) return null;

    if (typeof result === "string") {
      return (
        <div className="p-4">
          <div className="mb-3 flex items-center space-x-2">
            {error ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span className="font-medium">
              {error ? "Erro na execução" : "Resultado"}
            </span>
            {executionTime && (
              <Badge className="text-xs" variant="secondary">
                {executionTime}ms
              </Badge>
            )}
          </div>
          <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-sm">
            {result}
          </pre>
        </div>
      );
    }

    if (result.columns && result.rows) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Resultados da Consulta</span>
              <Badge className="text-xs" variant="secondary">
                {result.rows.length} linha(s)
              </Badge>
              {executionTime && (
                <Badge className="text-xs" variant="secondary">
                  {executionTime}ms
                </Badge>
              )}
            </div>
            <Button onClick={downloadResults} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Baixar CSV
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  {result.columns.map(col => (
                    <TableHead className="whitespace-nowrap" key={col.name}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{col.name}</span>
                        <Badge className="text-xs" variant="secondary">
                          {col.type}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row, rowIndex) => {
                  const firstCol = result.columns[0];
                  const firstValue = firstCol
                    ? String(row[firstCol.name] ?? "")
                    : "";
                  const rowKey = `query-result-${firstValue}-${rowIndex}`;

                  return (
                    <TableRow key={rowKey}>
                      {result.columns.map(col => (
                        <TableCell
                          className="max-w-xs whitespace-nowrap"
                          key={col.name}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate">
                                  {String(row[col.name] ?? "")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-md whitespace-pre-wrap break-all">
                                  {String(row[col.name] ?? "")}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      );
    }

    return null;
  }, [result, error, executionTime, downloadResults]);

  return (
    <div className="flex h-full flex-col">
      {/* Query Input */}
      <div className="space-y-4 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Consulta SQL</h3>
          <div className="flex items-center space-x-2">
            <Button
              disabled={!query.trim()}
              onClick={saveQuery}
              size="sm"
              variant="outline"
            >
              <Save className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            <Button
              disabled={!query.trim()}
              onClick={clearQuery}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button
              disabled={isExecuting || !query.trim()}
              onClick={executeQuery}
              size="sm"
            >
              {isExecuting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Executar
            </Button>
          </div>
        </div>

        <Textarea
          className="min-h-[120px] font-mono text-sm"
          disabled={isExecuting}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              executeQuery();
            }
          }}
          placeholder="Digite sua consulta SQL aqui...&#10;&#10;Exemplo:&#10;SELECT * FROM wp_posts WHERE post_status = 'publish' LIMIT 10;"
          value={query}
        />

        {query.trim() && (
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              Pressione Ctrl+Enter para executar rapidamente
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {(result || error) && (
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="p-4">
              <div className="mb-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">
                  Erro na Consulta
                </span>
              </div>
              <pre className="whitespace-pre-wrap rounded-md border border-destructive/20 bg-destructive/10 p-3 font-mono text-sm">
                {error}
              </pre>
            </div>
          ) : (
            renderResult()
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !error && !isExecuting && (
        <div className="flex flex-1 items-center justify-center">
          <div className="p-4 text-center">
            <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-lg">
              Pronto para executar consultas
            </h3>
            <p className="mb-4 max-w-md text-muted-foreground">
              Digite uma consulta SQL acima e clique em "Executar" para ver os
              resultados.
            </p>
            <div className="space-y-1 text-muted-foreground text-sm">
              <p>
                <strong>Dicas:</strong>
              </p>
              <p>• Use LIMIT para evitar resultados muito grandes</p>
              <p>• Teste consultas SELECT antes de modificar dados</p>
              <p>• Use aspas graves (`) ao redor de nomes de tabelas/colunas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
