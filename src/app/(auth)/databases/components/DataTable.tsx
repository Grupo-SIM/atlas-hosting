"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  flexRender,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Plus,
  Save,
  X,
  RefreshCw,
  Search,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Key,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getDbTableDataAction,
  updateTableRowAction,
  insertTableRowAction,
  deleteTableRowAction,
  bulkDeleteRowsAction,
  type TableColumn,
  type TableRowData,
  type TableDataResult,
} from "../actions";
import { cn } from "@/lib/utils";

interface DataTableProps {
  instanceId: number;
  tableName: string;
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    order?: string;
  };
}

interface EditingCell {
  rowId: string;
  columnName: string;
  value: string;
}

export function DataTable({ instanceId, tableName, searchParams }: DataTableProps) {
  const router = useRouter();
  const params = useSearchParams();
  
  // State
  const [data, setData] = useState<TableRowData[]>([]);
  const [originalData, setOriginalData] = useState<TableRowData[]>([]);
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchParams.search || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const currentPage = Number.parseInt(searchParams.page || "1", 10) - 1;
  const pageSize = Number.parseInt(searchParams.limit || "50", 10);

  // Generate stable row ID
  const getRowId = useCallback((row: TableRowData, index: number): string => {
    if (columns.length === 0) return `row-${index}`;
    
    const primaryKeyColumns = columns.filter(col => col.isPrimaryKey);
    if (primaryKeyColumns.length > 0) {
      const pkValues = primaryKeyColumns
        .map(col => String(row[col.name] ?? ""))
        .join("-");
      return pkValues ? `pk-${pkValues}` : `row-${index}`;
    }
    
    // Fallback to first column + index
    const firstCol = columns[0];
    if (firstCol && row[firstCol.name] != null) {
      return `col-${firstCol.name}-${String(row[firstCol.name])}-${index}`;
    }
    
    return `row-${index}`;
  }, [columns]);

  // Fetch table data
  const fetchTableData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result: TableDataResult = await getDbTableDataAction(instanceId, tableName);
      setColumns(result.columns);
      setData(result.rows);
      setOriginalData(result.rows);
      setRowSelection({});
      setEditingCell(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar dados",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [instanceId, tableName]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  // Update URL when filters change
  const updateURL = useCallback((updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(params);
    
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }

    router.push(`?${newParams.toString()}`);
  }, [params, router]);

  // Cell editing functions
  const startEditing = useCallback((rowId: string, columnName: string, currentValue: unknown) => {
    setEditingCell({
      rowId,
      columnName,
      value: String(currentValue ?? ""),
    });
  }, []);

  const updateCellValue = useCallback((value: string) => {
    setEditingCell(prev => prev ? { ...prev, value } : null);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCell(null);
  }, []);

  const saveCell = useCallback(async () => {
    if (!editingCell) return;

    const rowIndex = data.findIndex((_, index) => getRowId(data[index], index) === editingCell.rowId);
    if (rowIndex === -1) return;

    const originalRow = originalData[rowIndex];
    const currentRow = data[rowIndex];
    const newRowData = { ...currentRow, [editingCell.columnName]: editingCell.value };

    try {
      const primaryKeyColumns = columns.filter(col => col.isPrimaryKey);
      await updateTableRowAction(instanceId, tableName, primaryKeyColumns, originalRow, newRowData);
      
      // Update local data
      setData(prev => prev.map((row, index) => 
        index === rowIndex ? newRowData : row
      ));
      setOriginalData(prev => prev.map((row, index) => 
        index === rowIndex ? newRowData : row
      ));
      
      setEditingCell(null);
      toast({
        title: "Célula atualizada",
        description: "Os dados foram salvos com sucesso.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [editingCell, data, originalData, getRowId, instanceId, tableName, columns]);

  // Delete functions
  const deleteSelectedRows = useCallback(async () => {
    const selectedRowIds = Object.keys(rowSelection);
    const selectedRows = selectedRowIds
      .map(rowId => {
        const index = data.findIndex((_, i) => getRowId(data[i], i) === rowId);
        return index !== -1 ? originalData[index] : null;
      })
      .filter(Boolean) as TableRowData[];

    if (selectedRows.length === 0) return;

    try {
      setIsDeleting(true);
      const primaryKeyColumns = columns.filter(col => col.isPrimaryKey);
      await bulkDeleteRowsAction(instanceId, tableName, primaryKeyColumns, selectedRows);
      await fetchTableData(); // Refresh data
      setDeleteDialogOpen(false);
      toast({
        title: "Linhas excluídas",
        description: `${selectedRows.length} linha(s) foram excluídas com sucesso.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      toast({
        title: "Erro ao excluir",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [rowSelection, data, originalData, getRowId, instanceId, tableName, fetchTableData, columns]);

  // Table columns configuration
  const tableColumns = useMemo<ColumnDef<TableRowData>[]>(() => {
    if (columns.length === 0) return [];

    const cols: ColumnDef<TableRowData>[] = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todas"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
    ];

    columns.forEach((col) => {
      cols.push({
        accessorKey: col.name,
        header: ({ column }) => (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-1"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span className="font-medium">{col.name}</span>
              {col.isPrimaryKey && <Key className="h-3 w-3 text-yellow-500 ml-1" />}
              <Badge variant="secondary" className="text-xs ml-1">
                {col.type}
              </Badge>
              {column.getIsSorted() === "asc" ? (
                <SortAsc className="h-4 w-4 ml-1" />
              ) : column.getIsSorted() === "desc" ? (
                <SortDesc className="h-4 w-4 ml-1" />
              ) : (
                <ArrowUpDown className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        ),
        cell: ({ row, column }) => {
          const value = row.getValue(column.id);
          const rowId = getRowId(row.original, row.index);
          const columnName = col.name;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnName === columnName;

          return (
            <div className="min-w-[100px] max-w-[300px]">
              {isEditing ? (
                <div className="flex items-center space-x-1">
                  <Input
                    value={editingCell.value}
                    onChange={(e) => updateCellValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveCell();
                      } else if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                    autoFocus
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="ghost" onClick={saveCell}>
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[32px] flex items-center"
                  onClick={() => startEditing(rowId, columnName, value)}
                  title="Clique para editar"
                >
                  <span className="truncate text-sm">
                    {String(value ?? "")}
                  </span>
                </div>
              )}
            </div>
          );
        },
      });
    });

    return cols;
  }, [columns, editingCell, getRowId, startEditing, updateCellValue, saveCell, cancelEditing]);

  // Table instance
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row, index) => getRowId(row, index),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      rowSelection,
      sorting,
      globalFilter,
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageIndex: currentPage,
        pageSize,
      },
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <p className="text-lg font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchTableData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em todas as colunas..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                updateURL({ search: e.target.value || undefined, page: undefined });
              }}
              className="pl-9 w-[300px]"
            />
          </div>
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir {selectedCount} selecionada(s)
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {table.getFilteredRowModel().rows.length} linha(s)
          </Badge>
          <Button onClick={fetchTableData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-md border">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} resultado(s)
          </p>
          {table.getPageCount() > 1 && (
            <p className="text-sm text-muted-foreground">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.setPageIndex(0);
              updateURL({ page: "1" });
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage();
              updateURL({ page: String(table.getState().pagination.pageIndex) });
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage();
              updateURL({ page: String(table.getState().pagination.pageIndex + 2) });
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
              updateURL({ page: String(table.getPageCount()) });
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir {selectedCount} linha(s) selecionada(s)?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={deleteSelectedRows}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
