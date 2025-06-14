"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  DatabaseZap,
  Edit3,
  ListTree,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getDbTableDataAction,
  getDbTablesAction,
  runDbQueryAction,
} from "../actions";
import type { TableColumn, TableDataResult, TableRowData } from "../actions";
import { Badge } from "@/components/ui/badge";
import { FaCircleInfo } from "react-icons/fa6"

interface DatabaseEditorProps {
  instanceId: number;
  domainName: string;
}

export default function DatabaseEditor({
  instanceId,
  domainName,
}: DatabaseEditorProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<
    string | TableRowData[] | TableDataResult | null
  >(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  const fetchTables = useCallback(async () => {
    setIsLoadingTables(true);
    setError(null);
    try {
      const tableList = await getDbTablesAction(instanceId);
      setTables(tableList);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(`Falha ao buscar tabelas: ${errorMessage}`);
      toast({
        title: "Erro ao Buscar Tabelas",
        description: errorMessage,
        variant: "destructive",
      });
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  }, [instanceId]);

  const fetchTableData = useCallback(
    async (tableName: string) => {
      if (!tableName) return;
      setIsLoadingData(true);
      setError(null);
      setTableData([]);
      setTableColumns([]);
      try {
        const result = await getDbTableDataAction(instanceId, tableName);
        setTableData(result.rows);
        setTableColumns(result.columns);
        if (result.rows.length === 0 && result.columns.length === 0) {
          console.warn(
            `Table ${tableName} is empty and no columns were returned. The server action should handle DESCRIBE if possible.`
          );
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(
          `Falha ao buscar dados da tabela ${tableName}: ${errorMessage}`
        );
        toast({
          title: "Erro ao Buscar Dados da Tabela",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    },
    [instanceId]
  );

  const handleRunQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Consulta Vazia",
        description: "Por favor, insira uma consulta SQL.",
        variant: "default",
      });
      return;
    }
    setIsQueryLoading(true);
    setQueryResult(null);
    setError(null);
    try {
      const resultData = await runDbQueryAction(instanceId, query.trim(), {});
      setQueryResult(resultData);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setError(`Falha na consulta: ${errorMessage}`);
      setQueryResult(`Erro: ${errorMessage}`);
      toast({
        title: "Erro na Consulta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsQueryLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (selectedTable) {
      setQueryResult(null);
      setError(null); // Clear general errors when a new table is selected
      fetchTableData(selectedTable);
    } else {
      // Only clear table data if no table is selected, don't clear queryResult here
      setTableData([]);
      setTableColumns([]);
    }
  }, [selectedTable, fetchTableData]);

  const filteredTables = tables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderQueryResultContent = () => {
    if (!queryResult) return null;

    if (typeof queryResult === "string") {
      return (
        <pre className="p-4 text-sm whitespace-pre-wrap bg-muted/50 rounded-md">
          {queryResult}
        </pre>
      );
    }

    let displayColumns: TableColumn[] = [];
    let displayRows: TableRowData[] = [];

    if (Array.isArray(queryResult)) {
      displayRows = queryResult;
      if (
        queryResult.length > 0 &&
        typeof queryResult[0] === "object" &&
        queryResult[0] !== null
      ) {
        displayColumns = Object.keys(queryResult[0]).map((key) => ({
          name: key,
          type: "unknown",
        }));
      }
    } else if (queryResult.columns && queryResult.rows) {
      displayColumns = queryResult.columns;
      displayRows = queryResult.rows;
    }

    if (
      displayRows.length === 0 &&
      displayColumns.length === 0 &&
      typeof queryResult !== "string"
    ) {
      return (
        <p className="text-muted-foreground text-sm p-4 text-center">
          Consulta executada, mas nenhum dado foi retornado ou a estrutura está vazia.
        </p>
      );
    }

    if (
      displayRows.length === 0 &&
      displayColumns.length > 0 &&
      typeof queryResult !== "string"
    ) {
      return (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {displayColumns.map((col) => (
                  <TableHead key={col.name} className="whitespace-nowrap">
                    {col.name}
                    {col.type !== "unknown" && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {col.type}
                      </Badge>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={displayColumns.length}
                  className="text-center text-muted-foreground h-24"
                >
                  Nenhuma linha retornada para esta consulta.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </>
      );
    }

    if (displayColumns.length === 0 && displayRows.length > 0) {
      // Fallback if columns are not explicitly provided but rows exist (e.g. simple array of objects from query)
      displayColumns = Object.keys(displayRows[0]).map((key) => ({
        name: key,
        type: "unknown",
      }));
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {displayColumns.map((col) => (
              <TableHead key={col.name} className="whitespace-nowrap">
                {col.name}
                {col.type !== "unknown" && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {col.type}
                  </Badge>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRows.map((row, rowIndex) => (
            <TableRow key={`qr-${rowIndex}`}>
              {displayColumns.map((col) => (
                <TableCell
                  key={`qr-cell-${rowIndex}-${col.name}`}
                  className="whitespace-nowrap max-w-xs truncate"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{String(row[col.name])}</span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-md bg-popover text-popover-foreground p-2 rounded shadow-lg text-xs break-all whitespace-pre-wrap"
                    >
                      {String(row[col.name])}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] max-h-[800px]">
        <Card className="lg:w-1/3 xl:w-1/4 shadow-xl border-border/50 bg-card/60 backdrop-blur-md flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ListTree className="h-5 w-5 mr-2 text-primary" />
              Tabelas ({domainName})
            </CardTitle>
            <Input
              placeholder="Buscar tabelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2 bg-background/70"
            />
          </CardHeader>
          <CardContent className="pr-0 flex-grow overflow-hidden">
            {isLoadingTables ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error && tables.length === 0 && !isLoadingTables ? (
              <div className="text-destructive p-4 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error.replace("Falha ao buscar tabelas: ", "")}
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                {filteredTables.length > 0 ? (
                  filteredTables.map((table) => (
                    <Button
                      key={table}
                      variant={selectedTable === table ? "secondary" : "ghost"}
                      className={`w-full justify-start mb-1 text-left h-auto py-2 ${selectedTable === table ? "bg-primary/20 text-primary-foreground hover:bg-primary/30" : "hover:bg-muted/50"}`}
                      onClick={() => {
                        setSelectedTable(table);
                      }}
                    >
                      {table}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm p-4 text-center">
                    Nenhuma tabela encontrada{searchTerm && " correspondente à sua busca"}.
                  </p>
                )}
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            )}
          </CardContent>
          <div className="border-t mt-auto p-4 space-y-3">
            <h3 className="flex items-center text-md font-semibold">
              <Edit3 className="h-5 w-5 mr-2 text-primary" />
              Consulta Personalizada
            </h3>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM sua_tabela WHERE condicao;"
              className="w-full h-28 p-2 border rounded-md bg-background/70 focus:ring-1 focus:ring-primary text-sm resize-none"
            />
            <Button
              onClick={() => {
                handleRunQuery();
                setSelectedTable(null); // Deselect table when running custom query
                setError(null); // Clear errors
              }}
              disabled={isQueryLoading}
              className="w-full"
            >
              {isQueryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <DatabaseZap className="h-4 w-4 mr-2" />
              )}
              Executar Consulta
            </Button>
          </div>
        </Card>

        <Card className="lg:w-2/3 xl:w-3/4 flex-grow shadow-xl border-border/50 bg-card/60 backdrop-blur-md flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center text-xl">
                  {selectedTable ? (
                    <>
                      <DatabaseZap className="h-6 w-6 mr-2 text-primary" /> Dados
                      para:{" "}
                      <span className="font-mono ml-2 px-2 py-1 bg-muted/70 rounded-md text-sm">
                        {selectedTable}
                      </span>
                    </>
                  ) : queryResult ? (
                    <>
                      <Search className="h-6 w-6 mr-2 text-primary" /> Resultado da
                      Consulta
                    </>
                  ) : (
                    "Selecione uma tabela ou execute uma consulta"
                  )}
                </CardTitle>
                {selectedTable && (
                  <CardDescription className="mt-1">
                    Exibindo linhas iniciais. (Máx. 50)
                  </CardDescription>
                )}
              </div>
              {selectedTable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchTableData(selectedTable)}
                      disabled={isLoadingData}
                      className="bg-background/70"
                    >
                      <RotateCcw
                        className={`h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Atualizar Dados da Tabela</TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-0">
            {isLoadingData || isQueryLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : error && (selectedTable || queryResult) ? (
              <div className="text-destructive p-6 text-center flex flex-col items-center justify-center h-full">
                <AlertCircle className="h-10 w-10 mb-3" />
                <p className="font-semibold text-lg mb-1">Erro</p>
                <p className="text-sm">
                  {error
                    .replace(/^Erro: /i, "")
                    .replace(/^Falha na consulta: /i, "")
                    .replace(/^Falha ao buscar dados da tabela.*?: /i, "")
                    .replace(/^Falha ao buscar tabelas: /i, "")}
                </p>
              </div>
            ) : queryResult ? (
              <ScrollArea className="h-full p-4 border-t">
                {renderQueryResultContent()}
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : selectedTable && tableColumns.length > 0 ? (
              <ScrollArea className="h-full p-4 border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableColumns.map((col) => (
                        <TableHead key={col.name} className="whitespace-nowrap">
                          {col.name}
                          <Badge variant="secondary" className="text-xs ml-1">
                            {col.type}
                          </Badge>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.slice(1).map((row, rowIndex) => (
                      <TableRow key={`tr-${rowIndex}`}>
                        {tableColumns.map((col) => (
                          <TableCell
                            key={`td-${rowIndex}-${col.name}`}
                            className="whitespace-nowrap max-w-xs truncate"
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{String(row[col.name])}</span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-md bg-popover text-popover-foreground p-2 rounded shadow-lg text-xs break-all whitespace-pre-wrap"
                              >
                                {String(row[col.name])}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {tableData.length === 0 && (
                  <p className="text-muted-foreground p-4 flex items-center gap-2">
                    <FaCircleInfo className="h-[1em] w-[1em]" />
                    Tabela vazia.
                  </p>
                )}
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : selectedTable ? (
              <div className="text-muted-foreground p-6 text-center flex flex-col items-center justify-center h-full">
                <Search className="h-10 w-10 mb-3 text-muted-foreground/60" />
                <p className="font-semibold text-lg mb-1">Nenhuma Coluna Encontrada</p>
                <p className="text-sm">
                  Não foi possível determinar as colunas para {selectedTable}. Pode estar
                  vazia ou ser de um tipo não suportado.
                </p>
              </div>
            ) : (
              <div className="text-muted-foreground p-6 text-center flex flex-col items-center justify-center h-full">
                <DatabaseZap className="h-12 w-12 mb-4 text-muted-foreground/60" />
                <p className="text-lg font-medium">Explorador de Banco de Dados</p>
                <p className="text-sm">
                  Selecione uma tabela da lista à esquerda para visualizar seus dados,
                </p>
                <p className="text-sm">ou execute uma consulta SQL personalizada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
