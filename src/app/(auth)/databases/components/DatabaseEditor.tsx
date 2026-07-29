"use client";

import { Database, Terminal } from "lucide-react";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./DataTable";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { QueryEditor } from "./QueryEditor";
import { TableList } from "./TableList";

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

export function DatabaseEditor({
  instanceId,
  searchParams,
}: DatabaseEditorProps) {
  const currentTable = searchParams.table;
  const currentQuery = searchParams.query;

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Editor de Banco de Dados
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas tabelas e execute consultas SQL
          </p>
        </div>
      </div>

      <Tabs
        className="flex flex-1 flex-col"
        defaultValue={currentTable ? "table" : "query"}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="flex items-center gap-2" value="table">
            <Database className="h-4 w-4" />
            Visualizador de Tabelas
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="query">
            <Terminal className="h-4 w-4" />
            Editor de Consultas
          </TabsTrigger>
        </TabsList>

        <TabsContent className="flex flex-1 flex-col space-y-4" value="table">
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
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

            <Card className="flex flex-col lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">
                  {currentTable
                    ? `Dados da Tabela: ${currentTable}`
                    : "Dados da Tabela"}
                </CardTitle>
                <CardDescription>
                  {currentTable
                    ? "Visualize e edite os dados da tabela"
                    : "Selecione uma tabela para visualizar os dados"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-0">
                {currentTable ? (
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSkeleton />}>
                      <DataTable
                        instanceId={instanceId}
                        searchParams={searchParams}
                        tableName={currentTable}
                      />
                    </Suspense>
                  </ErrorBoundary>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>Selecione uma tabela para começar</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="flex flex-1 flex-col" value="query">
          <Card className="flex flex-1 flex-col">
            <CardHeader>
              <CardTitle className="text-base">
                Editor de Consultas SQL
              </CardTitle>
              <CardDescription>
                Execute consultas personalizadas no banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSkeleton />}>
                  <QueryEditor
                    initialQuery={currentQuery}
                    instanceId={instanceId}
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
