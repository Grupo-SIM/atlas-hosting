"use client";

import { Suspense } from "react";
import { TableList } from "./TableList";
import { QueryEditor } from "./QueryEditor";
import { DataTable } from "./DataTable";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorBoundary } from "./ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Terminal } from "lucide-react";

interface DatabaseEditorProps {
  instanceId: number;
  searchParams: {
    table?: string;
    query?: string;
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    order?: string;
  };
}

export function DatabaseEditor({ instanceId, searchParams }: DatabaseEditorProps) {
  const currentTable = searchParams.table;
  const currentQuery = searchParams.query;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor de Banco de Dados</h1>
          <p className="text-muted-foreground">
            Gerencie suas tabelas e execute consultas SQL
          </p>
        </div>
      </div>

      <Tabs defaultValue={currentTable ? "table" : "query"} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Visualizador de Tabelas
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Editor de Consultas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="flex-1 flex flex-col space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Tabelas do Banco</CardTitle>
                <CardDescription>
                  Selecione uma tabela para visualizar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton />}>
                    <TableList 
                      instanceId={instanceId} 
                      selectedTable={currentTable}
                    />
                  </Suspense>
                </ErrorBoundary>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">
                  {currentTable ? `Dados da Tabela: ${currentTable}` : "Dados da Tabela"}
                </CardTitle>
                <CardDescription>
                  {currentTable 
                    ? "Visualize e edite os dados da tabela"
                    : "Selecione uma tabela para visualizar os dados"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {currentTable ? (
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSkeleton />}>
                      <DataTable 
                        instanceId={instanceId}
                        tableName={currentTable}
                        searchParams={searchParams}
                      />
                    </Suspense>
                  </ErrorBoundary>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione uma tabela para começar</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="query" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Editor de Consultas SQL</CardTitle>
              <CardDescription>
                Execute consultas personalizadas no banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSkeleton />}>
                  <QueryEditor 
                    instanceId={instanceId}
                    initialQuery={currentQuery}
                  />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}