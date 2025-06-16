"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Table, 
  Search, 
  Loader2, 
  RefreshCw,
  Database,
  AlertCircle
} from "lucide-react";
import { getDbTablesAction } from "../actions";
import { cn } from "@/lib/utils";

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
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar tabelas",
        description: errorMessage,
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
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">{error}</p>
        <Button onClick={handleRefresh} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tabelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {filteredTables.length} {filteredTables.length === 1 ? "tabela" : "tabelas"}
          </Badge>
          <Button onClick={handleRefresh} size="sm" variant="ghost">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredTables.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Nenhuma tabela encontrada" : "Nenhuma tabela disponível"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTables.map((table) => (
                <Button
                  key={table}
                  variant={selectedTable === table ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3",
                    selectedTable === table && "bg-accent"
                  )}
                  onClick={() => handleTableSelect(table)}
                >
                  <Table className="h-4 w-4 mr-2 flex-shrink-0" />
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
