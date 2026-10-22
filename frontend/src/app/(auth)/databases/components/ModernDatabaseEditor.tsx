"use client";

import {
  type Cell,
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { isEqual } from "lodash";
import {
  AlertCircle,
  ArrowUpDown,
  Columns3,
  DatabaseZap,
  Edit3,
  ExternalLink,
  Eye,
  Key,
  ListTree,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import type {
  TableColumn,
  TableDataResult,
  TableRowData,
  TableSchema,
} from "../actions";
import {
  addColumnAction,
  bulkDeleteRowsAction,
  dropColumnAction,
  getDbTableDataAction,
  getDbTablesAction,
  getTableSchemaAction,
  insertTableRowAction,
  runDbQueryAction,
  updateTableRowAction,
} from "../actions";

// Optimized Table Cell Component
interface TableCellContentProps {
  value: unknown;
  rowId: string;
  columnName: string;
  editingCell: EditingCell | undefined;
  onStartEditing: (rowId: string, columnName: string, value: unknown) => void;
  onUpdateCellValue: (rowId: string, columnName: string, value: string) => void;
  onSaveCell: (rowId: string, columnName: string) => void;
  onCancelEditing: (rowId: string, columnName: string) => void;
}

const TableCellContent = memo<TableCellContentProps>(
  ({
    value,
    rowId,
    columnName,
    editingCell,
    onStartEditing,
    onUpdateCellValue,
    onSaveCell,
    onCancelEditing,
  }) => {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          onSaveCell(rowId, columnName);
        } else if (e.key === "Escape") {
          onCancelEditing(rowId, columnName);
        }
      },
      [onSaveCell, onCancelEditing, rowId, columnName]
    );

    const handleStartEditing = useCallback(() => {
      onStartEditing(rowId, columnName, value);
    }, [onStartEditing, rowId, columnName, value]);

    const handleUpdateValue = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateCellValue(rowId, columnName, e.target.value);
      },
      [onUpdateCellValue, rowId, columnName]
    );

    const handleSave = useCallback(() => {
      onSaveCell(rowId, columnName);
    }, [onSaveCell, rowId, columnName]);

    const handleCancel = useCallback(() => {
      onCancelEditing(rowId, columnName);
    }, [onCancelEditing, rowId, columnName]);

    const displayValue = useMemo(() => String(value ?? ""), [value]);

    if (editingCell) {
      return (
        <div className="flex items-center space-x-1">
          <Input
            autoFocus
            className="h-8 text-xs"
            onChange={handleUpdateValue}
            onKeyDown={handleKeyDown}
            value={editingCell.value}
          />
          <Button
            className="h-8 w-8 p-0"
            onClick={handleSave}
            size="sm"
            variant="ghost"
          >
            <Save className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            className="h-8 w-8 p-0"
            onClick={handleCancel}
            size="sm"
            variant="ghost"
          >
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex min-h-[2rem] w-full cursor-pointer items-center rounded p-1 text-left hover:bg-muted/50"
            onClick={handleStartEditing}
            type="button"
          >
            <span className="max-w-xs truncate">{displayValue}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-md whitespace-pre-wrap break-all">
            {displayValue}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  }
);

TableCellContent.displayName = "TableCellContent";

// Optimized Column Header Component
interface ColumnHeaderProps {
  column: Column<TableRowData, unknown>;
  colData: TableColumn;
  filter: ColumnFilter | undefined;
  onFilterChange: (columnName: string, value: string) => void;
  onColumnDrop?: (columnName: string) => void;
}

const ColumnHeader = memo<ColumnHeaderProps>(
  ({ column, colData, filter, onFilterChange, onColumnDrop }) => {
    const handleSortToggle = useCallback(() => {
      column.toggleSorting(column.getIsSorted() === "asc");
    }, [column]);

    const handleFilterChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange(colData.name, e.target.value);
      },
      [onFilterChange, colData.name]
    );

    const sortIcon = useMemo(() => {
      const sortDirection = column.getIsSorted();
      if (sortDirection === "asc") {
        return <SortAsc className="h-4 w-4" />;
      }
      if (sortDirection === "desc") {
        return <SortDesc className="h-4 w-4" />;
      }
      return <ArrowUpDown className="h-4 w-4" />;
    }, [column]);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{colData.name}</span>
            {colData.isPrimaryKey && (
              <Key className="h-3 w-3 text-yellow-500" />
            )}
            <Badge className="text-xs" variant="secondary">
              {colData.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              className="h-8 p-0 lg:p-1"
              onClick={handleSortToggle}
              size="sm"
              variant="ghost"
            >
              {sortIcon}
            </Button>
            {onColumnDrop && !colData.isPrimaryKey && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações da Coluna</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onColumnDrop(colData.name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover Coluna
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <Input
          className="h-8 text-xs"
          onChange={handleFilterChange}
          placeholder={`Filtrar ${colData.name}...`}
          value={filter?.value ?? ""}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.colData.name === nextProps.colData.name &&
      prevProps.colData.type === nextProps.colData.type &&
      prevProps.colData.isPrimaryKey === nextProps.colData.isPrimaryKey &&
      prevProps.filter?.value === nextProps.filter?.value &&
      prevProps.column.getIsSorted() === nextProps.column.getIsSorted()
    );
  }
);

ColumnHeader.displayName = "ColumnHeader";

// Optimized Table Row Component
interface TableRowItemProps {
  row: Row<TableRowData>;
  columns: ColumnDef<TableRowData>[];
}

const TableRowItem = memo<TableRowItemProps>(
  ({ row, columns }) => {
    // Generate unique cell keys using row ID + column name
    const generateCellKey = useCallback(
      (cellId: string, columnName: string) => {
        return `${row.id}-${columnName}-${cellId}`;
      },
      [row.id]
    );

    return (
      <TableRow
        className="hover:bg-muted/50"
        data-state={row.getIsSelected() && "selected"}
      >
        {row.getVisibleCells().map((cell: Cell<TableRowData, unknown>) => {
          const columnName = cell.column.id;
          const cellKey = generateCellKey(cell.id, columnName);

          return (
            <TableCell className="p-2" key={cellKey}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.row.id === nextProps.row.id &&
      prevProps.row.getIsSelected() === nextProps.row.getIsSelected() &&
      isEqual(prevProps.row.original, nextProps.row.original)
    );
  }
);

TableRowItem.displayName = "TableRowItem";

interface ModernDatabaseEditorProps {
  instanceId: number;
  domainName: string;
}

interface EditingCell {
  rowId: string;
  columnName: string;
  value: string;
}

interface ColumnFilter {
  columnName: string;
  value: string;
}

export default function ModernDatabaseEditor({
  instanceId,
  domainName,
}: ModernDatabaseEditorProps) {
  // State for tables and data
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);

  // Loading states
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Table features
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Editing state
  const [editingCells, setEditingCells] = useState<EditingCell[]>([]);
  const [originalData, setOriginalData] = useState<TableRowData[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Query functionality
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState<
    string | TableDataResult | null
  >(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Dialog states
  const [showSchemaDialog, setShowSchemaDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddRowDialog, setShowAddRowDialog] = useState(false);
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);

  // New row/column form data
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});
  const [newColumnForm, setNewColumnForm] = useState({
    defaultValue: "",
    isNullable: true,
    name: "",
    type: "VARCHAR(255)",
  });

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
        description: errorMessage,
        title: "Erro ao Buscar Tabelas",
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
      setTableSchema(null);
      setEditingCells([]);
      setHasChanges(false);
      setRowSelection({});

      try {
        const [result, schema] = await Promise.all([
          getDbTableDataAction(instanceId, tableName),
          getTableSchemaAction(instanceId, tableName),
        ]);

        setTableData(result.rows);
        setTableColumns(result.columns);
        setTableSchema(schema);
        setOriginalData([...result.rows]);

        // Reset column filters when switching tables
        setColumnFilters([]);
        setGlobalFilter("");

        if (result.rows.length === 0 && result.columns.length === 0) {
          console.warn(
            `Table ${tableName} is empty and no columns were returned.`
          );
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(
          `Falha ao buscar dados da tabela ${tableName}: ${errorMessage}`
        );
        toast({
          description: errorMessage,
          title: "Erro ao Buscar Dados da Tabela",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    },
    [instanceId]
  );

  const handleRunQuery = useCallback(async () => {
    if (!query.trim()) {
      toast({
        description: "Por favor, insira uma consulta SQL.",
        title: "Consulta Vazia",
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
        description: errorMessage,
        title: "Erro na Consulta",
        variant: "destructive",
      });
    } finally {
      setIsQueryLoading(false);
    }
  }, [instanceId, query]);

  // Cell editing functions
  const startEditing = useCallback(
    (rowId: string, columnName: string, currentValue: unknown) => {
      const editingCell: EditingCell = {
        columnName,
        rowId,
        value: String(currentValue ?? ""),
      };

      setEditingCells(prev => {
        const filtered = prev.filter(
          cell => !(cell.rowId === rowId && cell.columnName === columnName)
        );
        return [...filtered, editingCell];
      });
    },
    []
  );

  const updateCellValue = useCallback(
    (rowId: string, columnName: string, value: string) => {
      setEditingCells(prev =>
        prev.map(cell =>
          cell.rowId === rowId && cell.columnName === columnName
            ? { ...cell, value }
            : cell
        )
      );
    },
    []
  );

  const cancelEditing = useCallback((rowId: string, columnName: string) => {
    setEditingCells(prev =>
      prev.filter(
        cell => !(cell.rowId === rowId && cell.columnName === columnName)
      )
    );
  }, []);

  const saveCell = useCallback(
    async (rowId: string, columnName: string) => {
      const editingCell = editingCells.find(
        cell => cell.rowId === rowId && cell.columnName === columnName
      );

      if (!editingCell || !selectedTable) return;

      // Find the row data by using the getRowId function to match the ID
      const rowIndex = tableData.findIndex((row, index) => {
        const generatedId =
          tableColumns.length > 0
            ? (() => {
                const primaryKeyColumns = tableColumns.filter(
                  col => col.isPrimaryKey
                );
                if (primaryKeyColumns.length > 0) {
                  const pkValues = primaryKeyColumns
                    .map(col => {
                      const value = row[col.name];
                      return value !== null && value !== undefined
                        ? String(value)
                        : "";
                    })
                    .join("-");
                  return pkValues.length > 0
                    ? `pk-${pkValues}`
                    : `row-${index}`;
                }
                const firstCol = tableColumns[0];
                if (
                  firstCol &&
                  row[firstCol.name] !== null &&
                  row[firstCol.name] !== undefined
                ) {
                  const firstValue = String(row[firstCol.name]);
                  return `col-${firstCol.name}-${firstValue}-${index}`;
                }
                return `row-${index}`;
              })()
            : `row-${index}`;
        return generatedId === rowId;
      });

      if (rowIndex === -1) {
        console.error(`Could not find row with ID: ${rowId}`);
        return;
      }

      const originalRow = originalData[rowIndex];
      const currentRow = tableData[rowIndex];
      const newRowData = { ...currentRow, [columnName]: editingCell.value };

      try {
        const result = await updateTableRowAction(
          instanceId,
          selectedTable,
          tableColumns,
          originalRow,
          newRowData
        );

        if (result.success) {
          // Update local data
          setTableData(prev =>
            prev.map((row, index) =>
              index === rowIndex
                ? { ...row, [columnName]: editingCell.value }
                : row
            )
          );

          setOriginalData(prev =>
            prev.map((row, index) =>
              index === rowIndex
                ? { ...row, [columnName]: editingCell.value }
                : row
            )
          );

          cancelEditing(rowId, columnName);

          toast({
            description: "Célula atualizada com sucesso.",
            title: "Sucesso",
          });
        } else {
          toast({
            description: result.message,
            title: "Erro ao Salvar",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao salvar a célula.",
          title: "Erro ao Salvar",
          variant: "destructive",
        });
      }
    },
    [
      editingCells,
      selectedTable,
      tableData,
      originalData,
      tableColumns,
      instanceId,
      cancelEditing,
    ]
  );

  // Optimized column filter handler
  const handleColumnFilterChange = useCallback(
    (columnName: string, value: string) => {
      setColumnFilters(prev => {
        const filtered = prev.filter(f => f.columnName !== columnName);
        if (value) {
          return [...filtered, { columnName, value }];
        }
        return filtered;
      });
    },
    []
  );

  // Table columns configuration with optimized memoization
  const columns = useMemo<ColumnDef<TableRowData>[]>(() => {
    if (!tableColumns.length) return [];

    const selectColumn: ColumnDef<TableRowData> = {
      cell: ({ row }) => (
        <Checkbox
          aria-label="Selecionar linha"
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Selecionar todos"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      id: "select",
      size: 50,
    };

    const dataColumns: ColumnDef<TableRowData>[] = tableColumns.map(col => ({
      accessorKey: col.name,
      cell: ({ row, column }) => {
        const value = row.getValue(column.id);
        const rowId = row.id;
        const editingCell = editingCells.find(
          cell => cell.rowId === rowId && cell.columnName === col.name
        );

        return (
          <TableCellContent
            columnName={col.name}
            editingCell={editingCell}
            key={`${rowId}-${col.name}`}
            onCancelEditing={cancelEditing}
            onSaveCell={saveCell}
            onStartEditing={startEditing}
            onUpdateCellValue={updateCellValue}
            rowId={rowId}
            value={value}
          />
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const value = String(row.getValue(columnId) ?? "").toLowerCase();
        return value.includes(filterValue.toLowerCase());
      },
      header: ({ column }) => {
        const filter = columnFilters.find(f => f.columnName === col.name);
        return (
          <ColumnHeader
            colData={col}
            column={column}
            filter={filter}
            onColumnDrop={handleColumnDrop}
            onFilterChange={handleColumnFilterChange}
          />
        );
      },
    }));

    return [selectColumn, ...dataColumns];
  }, [
    tableColumns,
    editingCells,
    columnFilters,
    startEditing,
    updateCellValue,
    saveCell,
    cancelEditing,
    handleColumnFilterChange,
  ]);

  // Apply column filters to the table data with optimized memoization
  const filteredData = useMemo(() => {
    if (!columnFilters.length) return tableData;

    return tableData.filter(row =>
      columnFilters.every(filter => {
        const value = String(row[filter.columnName] ?? "").toLowerCase();
        return value.includes(filter.value.toLowerCase());
      })
    );
  }, [tableData, columnFilters]);

  // Generate unique row ID using primary key columns (memoized for stability)
  const getRowId = useCallback(
    (row: TableRowData, index: number) => {
      if (!tableColumns.length) return `row-${index}`;

      // Find primary key columns
      const primaryKeyColumns = tableColumns.filter(col => col.isPrimaryKey);

      if (primaryKeyColumns.length > 0) {
        // Create composite key from all primary key columns
        const pkValues = primaryKeyColumns
          .map(col => {
            const value = row[col.name];
            return value !== null && value !== undefined ? String(value) : "";
          })
          .join("-");

        // Ensure we always have a valid ID
        return pkValues.length > 0 ? `pk-${pkValues}` : `row-${index}`;
      }

      // Fallback: use first column value + index for uniqueness
      const firstCol = tableColumns[0];
      if (
        firstCol &&
        row[firstCol.name] !== null &&
        row[firstCol.name] !== undefined
      ) {
        const firstValue = String(row[firstCol.name]);
        return `col-${firstCol.name}-${firstValue}-${index}`;
      }

      // Final fallback
      return `row-${index}`;
    },
    [tableColumns]
  );

  // Memoized table configuration
  const tableConfig = useMemo(
    () => ({
      columns,
      data: filteredData,
      enableMultiRowSelection: true,
      // Ensure selection is preserved across data changes
      enableRowSelection: true,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getRowId,
      getSortedRowModel: getSortedRowModel(),
      globalFilterFn: "includesString" as const,
      onColumnVisibilityChange: setColumnVisibility,
      onGlobalFilterChange: setGlobalFilter,
      onRowSelectionChange: setRowSelection,
      onSortingChange: setSorting,
      state: {
        columnVisibility,
        globalFilter,
        rowSelection,
        sorting,
      },
    }),
    [
      filteredData,
      columns,
      getRowId,
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    ]
  );

  const table = useReactTable(tableConfig);

  // Bulk delete function - must be after table declaration
  const bulkDeleteSelected = useCallback(async () => {
    if (!selectedTable || Object.keys(rowSelection).length === 0) return;

    // Get selected rows using the table instance for accurate row mapping
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map(row => row.original);

    try {
      const result = await bulkDeleteRowsAction(
        instanceId,
        selectedTable,
        tableColumns,
        selectedRows
      );

      if (result.success) {
        await fetchTableData(selectedTable);
        setRowSelection({});
        toast({
          description: result.message,
          title: "Sucesso",
        });
      } else {
        toast({
          description: result.message,
          title: "Erro ao Deletar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro inesperado ao deletar linhas.",
        title: "Erro ao Deletar",
        variant: "destructive",
      });
    }
  }, [
    selectedTable,
    rowSelection,
    table,
    instanceId,
    tableColumns,
    fetchTableData,
  ]);

  // Performance monitoring
  const performanceMetrics = useMemo(() => {
    const tableRowCount = tableData.length;
    const filteredRowCount = filteredData.length;
    const columnCount = tableColumns.length;
    const editingCellsCount = editingCells.length;

    return {
      columnCount,
      editingCellsCount,
      filteredRowCount,
      filteringActive: columnFilters.length > 0 || globalFilter.length > 0,
      isLargeDataset: tableRowCount > 1000,
      tableRowCount,
    };
  }, [
    tableData.length,
    filteredData.length,
    tableColumns.length,
    editingCells.length,
    columnFilters,
    globalFilter,
  ]);

  // Memoized filtered tables
  const filteredTables = useMemo(
    () =>
      tables.filter(table =>
        table.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [tables, searchTerm]
  );

  // Memoized row count information
  const rowCountInfo = useMemo(
    () => ({
      filtered: table.getFilteredRowModel().rows.length,
      selected: Object.keys(rowSelection).length,
      total: table.getCoreRowModel().rows.length,
    }),
    [table, rowSelection]
  );

  // Memoized action button props
  const actionButtonProps = useMemo(
    () => ({
      canRefresh: !!selectedTable && !isLoadingData,
      hasSelectedRows: Object.keys(rowSelection).length > 0,
      selectedCount: Object.keys(rowSelection).length,
    }),
    [rowSelection, selectedTable, isLoadingData]
  );

  // Optimized useEffect hooks with proper dependencies
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (selectedTable) {
      setQueryResult(null);
      setError(null);
      fetchTableData(selectedTable);
    } else {
      setTableData([]);
      setTableColumns([]);
      setTableSchema(null);
    }
  }, [selectedTable, fetchTableData]);

  // Memoized query result renderer
  const renderQueryResult = useCallback(() => {
    if (!queryResult) return null;

    if (typeof queryResult === "string") {
      return (
        <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
          {queryResult}
        </pre>
      );
    }

    // Handle TableDataResult
    if (queryResult.columns && queryResult.rows) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              {queryResult.columns.map(col => (
                <TableHead className="whitespace-nowrap" key={col.name}>
                  {col.name}
                  <Badge className="ml-1 text-xs" variant="secondary">
                    {col.type}
                  </Badge>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {queryResult.rows.map((row, rowIndex) => {
              // Generate a unique key based on first column value + row index for better uniqueness
              const firstCol = queryResult.columns?.[0];
              const firstValue = firstCol
                ? String(row[firstCol.name] ?? "")
                : "";
              const rowKey = `query-result-${firstValue}-${rowIndex}`;
              return (
                <TableRow key={rowKey}>
                  {queryResult.columns?.map(col => (
                    <TableCell
                      className="max-w-xs truncate whitespace-nowrap"
                      key={`${rowKey}-${col.name}`}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{String(row[col.name] ?? "")}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-md whitespace-pre-wrap break-all">
                            {String(row[col.name] ?? "")}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      );
    }

    return null;
  }, [queryResult]);

  // Memoized event handlers
  const handleQueryExecute = useCallback(() => {
    handleRunQuery();
    setSelectedTable(null);
    setError(null);
  }, [handleRunQuery]);

  const handleTableRefresh = useCallback(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, fetchTableData]);

  const handleTableSelect = useCallback((tableName: string) => {
    setSelectedTable(tableName);
  }, []);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  // Debounced search handlers for better performance
  const debouncedSearchTermChange = useMemo(() => {
    const handleChange = (value: string) => {
      setSearchTerm(value);
    };
    // Simple debounce implementation
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleChange(value), 300);
    };
  }, []);

  const debouncedGlobalFilterChange = useMemo(() => {
    const handleChange = (value: string) => {
      setGlobalFilter(value);
    };
    // Simple debounce implementation
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleChange(value), 300);
    };
  }, []);

  const handleSearchTermChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearchTermChange(e.target.value);
    },
    [debouncedSearchTermChange]
  );

  const handleGlobalFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedGlobalFilterChange(e.target.value);
    },
    [debouncedGlobalFilterChange]
  );

  const handleSchemaDialogOpen = useCallback(() => {
    setShowSchemaDialog(true);
  }, []);

  const handleSchemaDialogClose = useCallback(() => {
    setShowSchemaDialog(false);
  }, []);

  const handleDeleteDialogOpen = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    bulkDeleteSelected();
    setShowDeleteDialog(false);
  }, [bulkDeleteSelected]);

  // New row/column handlers
  const handleAddRowSubmit = useCallback(async () => {
    if (!selectedTable) return;

    try {
      const result = await insertTableRowAction(
        instanceId,
        selectedTable,
        newRowData
      );

      if (result.success) {
        await fetchTableData(selectedTable);
        setNewRowData({});
        setShowAddRowDialog(false);
        toast({
          description: "Nova linha adicionada com sucesso.",
          title: "Sucesso",
        });
      } else {
        toast({
          description: result.message,
          title: "Erro ao Adicionar Linha",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro inesperado ao adicionar linha.",
        title: "Erro ao Adicionar Linha",
        variant: "destructive",
      });
    }
  }, [selectedTable, newRowData, instanceId, fetchTableData]);

  const handleAddColumnSubmit = useCallback(async () => {
    if (!selectedTable || !newColumnForm.name.trim()) return;

    try {
      const result = await addColumnAction(
        instanceId,
        selectedTable,
        newColumnForm.name.trim(),
        newColumnForm.type,
        newColumnForm.isNullable,
        newColumnForm.defaultValue || undefined
      );

      if (result.success) {
        await fetchTableData(selectedTable);
        setNewColumnForm({
          defaultValue: "",
          isNullable: true,
          name: "",
          type: "VARCHAR(255)",
        });
        setShowAddColumnDialog(false);
        toast({
          description: "Nova coluna adicionada com sucesso.",
          title: "Sucesso",
        });
      } else {
        toast({
          description: result.message,
          title: "Erro ao Adicionar Coluna",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro inesperado ao adicionar coluna.",
        title: "Erro ao Adicionar Coluna",
        variant: "destructive",
      });
    }
  }, [selectedTable, newColumnForm, instanceId, fetchTableData]);

  const handleColumnDrop = useCallback(
    async (columnName: string) => {
      if (!selectedTable) return;

      const confirmDelete = window.confirm(
        `Tem certeza de que deseja remover a coluna "${columnName}"? Esta ação não pode ser desfeita.`
      );

      if (!confirmDelete) return;

      try {
        const result = await dropColumnAction(
          instanceId,
          selectedTable,
          columnName
        );

        if (result.success) {
          await fetchTableData(selectedTable);
          toast({
            description: "Coluna removida com sucesso.",
            title: "Sucesso",
          });
        } else {
          toast({
            description: result.message,
            title: "Erro ao Remover Coluna",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao remover coluna.",
          title: "Erro ao Remover Coluna",
          variant: "destructive",
        });
      }
    },
    [selectedTable, instanceId, fetchTableData]
  );

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-12rem)] flex-col gap-6 lg:flex-row">
        {/* Left Sidebar - Tables and Query */}
        <Card className="flex flex-col border-border/50 bg-card/60 shadow-xl backdrop-blur-md lg:w-1/3 xl:w-1/4">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ListTree className="mr-2 h-5 w-5 text-primary" />
              Tabelas ({domainName})
            </CardTitle>
            <Input
              className="mt-2 bg-background/70"
              onChange={handleSearchTermChange}
              placeholder="Buscar tabelas..."
              value={searchTerm}
            />
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden pr-0">
            {isLoadingTables ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error && tables.length === 0 ? (
              <div className="flex items-center p-4 text-destructive text-sm">
                <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                {error.replace("Falha ao buscar tabelas: ", "")}
              </div>
            ) : (
              <ScrollArea className="h-full pr-4">
                {filteredTables.length > 0 ? (
                  filteredTables.map(table => (
                    <Button
                      className={`mb-1 h-auto w-full justify-start py-2 text-left ${
                        selectedTable === table
                          ? "bg-primary/20 text-primary-foreground hover:bg-primary/30"
                          : "hover:bg-muted/50"
                      }`}
                      key={table}
                      onClick={() => handleTableSelect(table)}
                      variant={selectedTable === table ? "secondary" : "ghost"}
                    >
                      {table}
                    </Button>
                  ))
                ) : (
                  <p className="p-4 text-center text-muted-foreground text-sm">
                    Nenhuma tabela encontrada
                    {searchTerm && " correspondente à sua busca"}.
                  </p>
                )}
              </ScrollArea>
            )}
          </CardContent>

          {/* Query Section */}
          <div className="mt-auto space-y-3 border-t p-4">
            <h3 className="flex items-center font-semibold text-md">
              <Edit3 className="mr-2 h-5 w-5 text-primary" />
              Consulta Personalizada
            </h3>
            <textarea
              className="h-28 w-full resize-none rounded-md border bg-background/70 p-2 text-sm focus:ring-1 focus:ring-primary"
              onChange={handleQueryChange}
              placeholder="SELECT * FROM sua_tabela WHERE condicao;"
              value={query}
            />
            <Button
              className="w-full"
              disabled={isQueryLoading}
              onClick={handleQueryExecute}
            >
              {isQueryLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DatabaseZap className="mr-2 h-4 w-4" />
              )}
              Executar Consulta
            </Button>
          </div>
        </Card>

        {/* Main Content - Table Editor */}
        <Card className="flex flex-grow flex-col overflow-hidden border-border/50 bg-card/60 shadow-xl backdrop-blur-md lg:w-2/3 xl:w-3/4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-xl">
                  {selectedTable ? (
                    <>
                      <DatabaseZap className="mr-2 h-6 w-6 text-primary" />
                      Editando:
                      <span className="ml-2 rounded-md bg-muted/70 px-2 py-1 font-mono text-sm">
                        {selectedTable}
                      </span>
                    </>
                  ) : queryResult ? (
                    <>
                      <Search className="mr-2 h-6 w-6 text-primary" />
                      Resultado da Consulta
                    </>
                  ) : (
                    "Selecione uma tabela ou execute uma consulta"
                  )}
                </CardTitle>
                {selectedTable && (
                  <CardDescription className="mt-1">
                    Editor completo com funcionalidades de busca, edição e
                    relacionamentos
                  </CardDescription>
                )}
              </div>

              {/* Action Buttons */}
              {selectedTable && (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setShowAddRowDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Nova Linha
                  </Button>

                  <Button
                    onClick={() => setShowAddColumnDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Columns3 className="mr-1 h-4 w-4" />
                    Nova Coluna
                  </Button>

                  {actionButtonProps.hasSelectedRows && (
                    <Button
                      onClick={handleDeleteDialogOpen}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Deletar ({actionButtonProps.selectedCount})
                    </Button>
                  )}

                  <Button
                    onClick={handleSchemaDialogOpen}
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Esquema
                  </Button>

                  <Button
                    disabled={!actionButtonProps.canRefresh}
                    onClick={handleTableRefresh}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw
                      className={`mr-1 h-4 w-4 ${isLoadingData ? "animate-spin" : ""}`}
                    />
                    Atualizar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-grow overflow-auto p-0">
            {isLoadingData || isQueryLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : error && (selectedTable || queryResult) ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-destructive">
                <AlertCircle className="mb-3 h-10 w-10" />
                <p className="mb-1 font-semibold text-lg">Erro</p>
                <p className="text-sm">
                  {error
                    .replace(/^Erro: /i, "")
                    .replace(/^Falha na consulta: /i, "")}
                </p>
              </div>
            ) : queryResult ? (
              <ScrollArea className="h-full border-t p-4">
                {renderQueryResult()}
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : selectedTable && tableColumns.length > 0 ? (
              <div className="h-full border-t">
                {/* Global Search */}
                <div className="border-b bg-muted/30 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        className="max-w-sm"
                        onChange={handleGlobalFilterChange}
                        placeholder="Busca global..."
                        value={globalFilter ?? ""}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground text-sm">
                        {rowCountInfo.filtered} de {rowCountInfo.total} linhas
                      </span>
                      {rowCountInfo.selected > 0 && (
                        <span className="font-medium text-primary text-sm">
                          {rowCountInfo.selected} selecionadas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <ScrollArea className="h-[calc(100%-5rem)]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <TableHead
                              className="whitespace-nowrap p-2"
                              key={header.id}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table
                          .getRowModel()
                          .rows.map(row => (
                            <TableRowItem
                              columns={columns}
                              key={row.id}
                              row={row}
                            />
                          ))
                      ) : (
                        <TableRow>
                          <TableCell
                            className="h-24 text-center"
                            colSpan={columns.length}
                          >
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <FaCircleInfo className="mb-2 h-8 w-8" />
                              <p>Nenhum resultado encontrado</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            ) : selectedTable ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <Search className="mb-3 h-10 w-10 text-muted-foreground/60" />
                <p className="mb-1 font-semibold text-lg">
                  Nenhuma Coluna Encontrada
                </p>
                <p className="text-sm">
                  Não foi possível determinar as colunas para {selectedTable}.
                  Pode estar vazia ou ser de um tipo não suportado.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <DatabaseZap className="mb-4 h-12 w-12 text-muted-foreground/60" />
                <p className="font-medium text-lg">
                  Editor de Banco de Dados Avançado
                </p>
                <p className="text-sm">
                  Selecione uma tabela da lista à esquerda para começar a
                  editar,
                </p>
                <p className="text-sm">
                  ou execute uma consulta SQL personalizada.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schema Dialog */}
      <Dialog onOpenChange={setShowSchemaDialog} open={showSchemaDialog}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Esquema da Tabela: {selectedTable}</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre estrutura, índices e relacionamentos
            </DialogDescription>
          </DialogHeader>

          {tableSchema && (
            <div className="space-y-6">
              {/* Columns */}
              <div>
                <h3 className="mb-3 font-semibold text-lg">Colunas</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nulável</TableHead>
                      <TableHead>Padrão</TableHead>
                      <TableHead>Extra</TableHead>
                      <TableHead>Chave</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableSchema.columns.map(col => (
                      <TableRow key={col.name}>
                        <TableCell className="font-medium">
                          {col.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{col.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {col.isNullable ? (
                            <Badge variant="secondary">Sim</Badge>
                          ) : (
                            <Badge variant="destructive">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell>{col.defaultValue || "-"}</TableCell>
                        <TableCell>{col.extra || "-"}</TableCell>
                        <TableCell>
                          {col.isPrimaryKey && (
                            <Badge className="mr-1" variant="default">
                              <Key className="mr-1 h-3 w-3" />
                              PK
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Foreign Keys */}
              {tableSchema.foreignKeys.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-lg">
                    Chaves Estrangeiras
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coluna</TableHead>
                        <TableHead>Tabela Referenciada</TableHead>
                        <TableHead>Coluna Referenciada</TableHead>
                        <TableHead>Constraint</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableSchema.foreignKeys.map((fk, index) => (
                        <TableRow key={`fk-${fk.constraintName}-${index}`}>
                          <TableCell className="font-medium">
                            {fk.columnName}
                          </TableCell>
                          <TableCell>
                            <Button
                              className="h-auto p-0"
                              onClick={() => {
                                setSelectedTable(fk.referencedTable);
                                setShowSchemaDialog(false);
                              }}
                              variant="link"
                            >
                              {fk.referencedTable}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </TableCell>
                          <TableCell>{fk.referencedColumn}</TableCell>
                          <TableCell>{fk.constraintName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Indexes */}
              {tableSchema.indexes.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-lg">Índices</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Coluna</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Único</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableSchema.indexes.map((index, i) => (
                        <TableRow key={`idx-${index.indexName}-${i}`}>
                          <TableCell className="font-medium">
                            {index.indexName}
                          </TableCell>
                          <TableCell>{index.columnName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{index.indexType}</Badge>
                          </TableCell>
                          <TableCell>
                            {index.isUnique ? (
                              <Badge variant="default">Sim</Badge>
                            ) : (
                              <Badge variant="secondary">Não</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja deletar{" "}
              {Object.keys(rowSelection).length} linha(s)? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleDeleteDialogClose} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} variant="destructive">
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Row Dialog */}
      <Dialog onOpenChange={setShowAddRowDialog} open={showAddRowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Linha</DialogTitle>
            <DialogDescription>
              Preencha os valores para a nova linha na tabela {selectedTable}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {tableColumns.map(col => (
              <div className="space-y-2" key={col.name}>
                <Label htmlFor={`new-row-${col.name}`}>
                  {col.name}
                  {col.isPrimaryKey && (
                    <Key className="ml-1 inline h-3 w-3 text-yellow-500" />
                  )}
                  <Badge className="ml-2 text-xs" variant="outline">
                    {col.type}
                  </Badge>
                </Label>
                <Input
                  id={`new-row-${col.name}`}
                  onChange={e =>
                    setNewRowData(prev => ({
                      ...prev,
                      [col.name]: e.target.value,
                    }))
                  }
                  placeholder={col.isNullable ? "Opcional" : "Obrigatório"}
                  value={newRowData[col.name] || ""}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowAddRowDialog(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button onClick={handleAddRowSubmit}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog onOpenChange={setShowAddColumnDialog} open={showAddColumnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Coluna</DialogTitle>
            <DialogDescription>
              Configure a nova coluna para a tabela {selectedTable}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="column-name">Nome da Coluna</Label>
              <Input
                id="column-name"
                onChange={e =>
                  setNewColumnForm(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="nome_da_coluna"
                value={newColumnForm.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="column-type">Tipo de Dados</Label>
              <Select
                onValueChange={value =>
                  setNewColumnForm(prev => ({
                    ...prev,
                    type: value,
                  }))
                }
                value={newColumnForm.type}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VARCHAR(255)">VARCHAR(255)</SelectItem>
                  <SelectItem value="TEXT">TEXT</SelectItem>
                  <SelectItem value="INT">INT</SelectItem>
                  <SelectItem value="BIGINT">BIGINT</SelectItem>
                  <SelectItem value="DECIMAL(10,2)">DECIMAL(10,2)</SelectItem>
                  <SelectItem value="DATETIME">DATETIME</SelectItem>
                  <SelectItem value="DATE">DATE</SelectItem>
                  <SelectItem value="TIME">TIME</SelectItem>
                  <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newColumnForm.isNullable}
                id="column-nullable"
                onCheckedChange={checked =>
                  setNewColumnForm(prev => ({
                    ...prev,
                    isNullable: checked,
                  }))
                }
              />
              <Label htmlFor="column-nullable">Permite valores nulos</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="column-default">Valor Padrão (Opcional)</Label>
              <Input
                id="column-default"
                onChange={e =>
                  setNewColumnForm(prev => ({
                    ...prev,
                    defaultValue: e.target.value,
                  }))
                }
                placeholder="NULL"
                value={newColumnForm.defaultValue}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowAddColumnDialog(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              disabled={!newColumnForm.name.trim()}
              onClick={handleAddColumnSubmit}
            >
              <Columns3 className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
