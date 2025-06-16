"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import {
  Play,
  Loader2,
  RotateCcw,
  Save,
  Download,
  AlertCircle,
  CheckCircle,
  Database,
} from "lucide-react";
import { runDbQueryAction, type TableDataResult } from "../actions";

interface QueryEditorProps {
  instanceId: number;
  initialQuery?: string;
}

export function QueryEditor({ instanceId, initialQuery = "" }: QueryEditorProps) {
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
        title: "Consulta vazia",
        description: "Por favor, insira uma consulta SQL.",
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
        title: "Consulta executada",
        description: `Consulta executada em ${endTime - startTime}ms`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      setExecutionTime(null);
      toast({
        title: "Erro na consulta",
        description: errorMessage,
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
    navigator.clipboard.writeText(query).then(() => {
      toast({
        title: "Consulta copiada",
        description: "A consulta foi copiada para a área de transferência.",
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a consulta.",
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
          result.columns.map(col => {
            const value = row[col.name];
            // Escape values that contain commas or quotes
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value ?? "");
          }).join(",")
        )
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
        title: "Download iniciado",
        description: "Os resultados foram baixados como CSV.",
      });
    } catch (err) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar os resultados.",
        variant: "destructive",
      });
    }
  }, [result]);

  const renderResult = useCallback(() => {
    if (!result) return null;

    if (typeof result === "string") {
      return (
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            {error ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span className="font-medium">
              {error ? "Erro na execução" : "Resultado"}
            </span>
            {executionTime && (
              <Badge variant="secondary" className="text-xs">
                {executionTime}ms
              </Badge>
            )}
          </div>
          <pre className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3 font-mono">
            {result}
          </pre>
        </div>
      );
    }

    if (result.columns && result.rows) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Resultados da Consulta</span>
              <Badge variant="secondary" className="text-xs">
                {result.rows.length} linha(s)
              </Badge>
              {executionTime && (
                <Badge variant="secondary" className="text-xs">
                  {executionTime}ms
                </Badge>
              )}
            </div>
            <Button onClick={downloadResults} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  {result.columns.map((col) => (
                    <TableHead key={col.name} className="whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{col.name}</span>
                        <Badge variant="secondary" className="text-xs">
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
                  const firstValue = firstCol ? String(row[firstCol.name] ?? "") : "";
                  const rowKey = `query-result-${firstValue}-${rowIndex}`;
                  
                  return (
                    <TableRow key={rowKey}>
                      {result.columns.map((col) => (
                        <TableCell key={col.name} className="whitespace-nowrap max-w-xs">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate">
                                  {String(row[col.name] ?? "")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-md break-all whitespace-pre-wrap">
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
    <div className="flex flex-col h-full">
      {/* Query Input */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Consulta SQL</h3>
          <div className="flex items-center space-x-2">
            <Button onClick={saveQuery} size="sm" variant="outline" disabled={!query.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={clearQuery} size="sm" variant="outline" disabled={!query.trim()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button onClick={executeQuery} size="sm" disabled={isExecuting || !query.trim()}>
              {isExecuting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Executar
            </Button>
          </div>
        </div>
        
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              executeQuery();
            }
          }}
          placeholder="Digite sua consulta SQL aqui...&#10;&#10;Exemplo:&#10;SELECT * FROM wp_posts WHERE post_status = 'publish' LIMIT 10;"
          className="min-h-[120px] font-mono text-sm"
          disabled={isExecuting}
        />
        
        {query.trim() && (
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
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
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium text-destructive">Erro na Consulta</span>
              </div>
              <pre className="text-sm whitespace-pre-wrap bg-destructive/10 border border-destructive/20 rounded-md p-3 font-mono">
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Pronto para executar consultas</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Digite uma consulta SQL acima e clique em "Executar" para ver os resultados.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Dicas:</strong></p>
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
