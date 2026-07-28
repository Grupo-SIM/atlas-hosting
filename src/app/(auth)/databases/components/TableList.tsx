"use client";

import {
  AlertCircle,
  Database,
  Loader2,
  RefreshCw,
  Search,
  Table,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getDbTablesAction } from "../actions";

interface TableListProps {
  instanceId: number;
  selectedTable?: string;
}

export function TableList({ instanceId, selectedTable }: TableListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tables, setTables] = useState<string[]>([]);
  const [filteredTables, setFilteredTables] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tableList = await getDbTablesAction(instanceId, { format: "csv" });
      setTables(tableList);
      setFilteredTables(tableList);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        description: errorMessage,
        title: "Erro ao carregar tabelas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    const filtered = tables.filter(table =>
      table.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTables(filtered);
  }, [tables, searchTerm]);

  const handleTableSelect = (tableName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("table", tableName);
    // Reset pagination when switching tables
    params.delete("page");
    params.delete("search");
    params.delete("sort");
    params.delete("order");
    router.push(`?${params.toString()}`);
  };

  const handleRefresh = () => {
    fetchTables();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
        <p className="mb-3 text-muted-foreground text-sm">{error}</p>
        <Button onClick={handleRefresh} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar tabelas..."
            value={searchTerm}
          />
        </div>
        <div className="flex items-center justify-between">
          <Badge className="text-xs" variant="secondary">
            {filteredTables.length}{" "}
            {filteredTables.length === 1 ? "tabela" : "tabelas"}
          </Badge>
          <Button onClick={handleRefresh} size="sm" variant="ghost">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredTables.length === 0 ? (
            <div className="py-8 text-center">
              <Database className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                {searchTerm
                  ? "Nenhuma tabela encontrada"
                  : "Nenhuma tabela disponível"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTables.map(table => (
                <Button
                  className={cn(
                    "h-auto w-full justify-start p-3 text-left",
                    selectedTable === table && "bg-accent"
                  )}
                  key={table}
                  onClick={() => handleTableSelect(table)}
                  variant={selectedTable === table ? "secondary" : "ghost"}
                >
                  <Table className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{table}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
