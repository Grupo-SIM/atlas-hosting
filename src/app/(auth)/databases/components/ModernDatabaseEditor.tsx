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
  Plus,
  Trash2,
  Save,
  X,
  CheckSquare,
  Square,
  Filter,
  MoreHorizontal,
  Key,
  ExternalLink,
  Download,
  Upload,
  Eye,
  EyeOff,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Table as TableIcon,
  Columns3,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo, memo } from "react";
import {
  getDbTableDataAction,
  getDbTablesAction,
  runDbQueryAction,
  updateTableRowAction,
  insertTableRowAction,
  deleteTableRowAction,
  getTableSchemaAction,
  bulkDeleteRowsAction,
  addColumnAction,
  dropColumnAction,
} from "../actions";
import type {
  TableColumn,
  TableDataResult,
  TableRowData,
  TableSchema,
} from "../actions";
import { Badge } from "@/components/ui/badge";
import { FaCircleInfo } from "react-icons/fa6";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  type Row,
  type Column,
  type Cell,
} from "@tanstack/react-table";
import { isEqual } from "lodash";

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
            value={editingCell.value}
            onChange={handleUpdateValue}
            className="h-8 text-xs"
            autoFocus
            onKeyDown={handleKeyDown}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleSave}
          >
            <Save className="h-3 w-3 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={handleCancel}
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
            type="button"
            className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[2rem] flex items-center w-full text-left"
            onClick={handleStartEditing}
          >
            <span className="truncate max-w-xs">{displayValue}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-md break-all whitespace-pre-wrap">
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
            <Badge variant="secondary" className="text-xs">
              {colData.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 p-0 lg:p-1"
              onClick={handleSortToggle}
            >
              {sortIcon}
            </Button>
            {onColumnDrop && !colData.isPrimaryKey && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações da Coluna</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onColumnDrop(colData.name)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Coluna
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <Input
          placeholder={`Filtrar ${colData.name}...`}
          value={filter?.value ?? ""}
          onChange={handleFilterChange}
          className="h-8 text-xs"
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
        data-state={row.getIsSelected() && "selected"}
        className="hover:bg-muted/50"
      >
        {row.getVisibleCells().map((cell: Cell<TableRowData, unknown>) => {
          const columnName = cell.column.id;
          const cellKey = generateCellKey(cell.id, columnName);

          return (
            <TableCell key={cellKey} className="p-2">
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
    name: "",
    type: "VARCHAR(255)",
    isNullable: true,
    defaultValue: "",
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

  const handleRunQuery = useCallback(async () => {
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
  }, [instanceId, query]);

  // Cell editing functions
  const startEditing = useCallback(
    (rowId: string, columnName: string, currentValue: unknown) => {
      const editingCell: EditingCell = {
        rowId,
        columnName,
        value: String(currentValue ?? ""),
      };

      setEditingCells((prev) => {
        const filtered = prev.filter(
          (cell) => !(cell.rowId === rowId && cell.columnName === columnName)
        );
        return [...filtered, editingCell];
      });
    },
    []
  );

  const updateCellValue = useCallback(
    (rowId: string, columnName: string, value: string) => {
      setEditingCells((prev) =>
        prev.map((cell) =>
          cell.rowId === rowId && cell.columnName === columnName
            ? { ...cell, value }
            : cell
        )
      );
    },
    []
  );

  const cancelEditing = useCallback((rowId: string, columnName: string) => {
    setEditingCells((prev) =>
      prev.filter(
        (cell) => !(cell.rowId === rowId && cell.columnName === columnName)
      )
    );
  }, []);

  const saveCell = useCallback(
    async (rowId: string, columnName: string) => {
      const editingCell = editingCells.find(
        (cell) => cell.rowId === rowId && cell.columnName === columnName
      );

      if (!editingCell || !selectedTable) return;

      // Find the row data by using the getRowId function to match the ID
      const rowIndex = tableData.findIndex((row, index) => {
        const generatedId =
          tableColumns.length > 0
            ? (() => {
                const primaryKeyColumns = tableColumns.filter(
                  (col) => col.isPrimaryKey
                );
                if (primaryKeyColumns.length > 0) {
                  const pkValues = primaryKeyColumns
                    .map((col) => {
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
          setTableData((prev) =>
            prev.map((row, index) =>
              index === rowIndex
                ? { ...row, [columnName]: editingCell.value }
                : row
            )
          );

          setOriginalData((prev) =>
            prev.map((row, index) =>
              index === rowIndex
                ? { ...row, [columnName]: editingCell.value }
                : row
            )
          );

          cancelEditing(rowId, columnName);

          toast({
            title: "Sucesso",
            description: "Célula atualizada com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao Salvar",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao Salvar",
          description: "Erro inesperado ao salvar a célula.",
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
      setColumnFilters((prev) => {
        const filtered = prev.filter((f) => f.columnName !== columnName);
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
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
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
      size: 50,
    };

    const dataColumns: ColumnDef<TableRowData>[] = tableColumns.map((col) => ({
      accessorKey: col.name,
      header: ({ column }) => {
        const filter = columnFilters.find((f) => f.columnName === col.name);
        return (
          <ColumnHeader
            column={column}
            colData={col}
            filter={filter}
            onFilterChange={handleColumnFilterChange}
            onColumnDrop={handleColumnDrop}
          />
        );
      },
      cell: ({ row, column }) => {
        const value = row.getValue(column.id);
        const rowId = row.id;
        const editingCell = editingCells.find(
          (cell) => cell.rowId === rowId && cell.columnName === col.name
        );

        return (
          <TableCellContent
            key={`${rowId}-${col.name}`}
            value={value}
            rowId={rowId}
            columnName={col.name}
            editingCell={editingCell}
            onStartEditing={startEditing}
            onUpdateCellValue={updateCellValue}
            onSaveCell={saveCell}
            onCancelEditing={cancelEditing}
          />
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const value = String(row.getValue(columnId) ?? "").toLowerCase();
        return value.includes(filterValue.toLowerCase());
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

    return tableData.filter((row) =>
      columnFilters.every((filter) => {
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
      const primaryKeyColumns = tableColumns.filter((col) => col.isPrimaryKey);

      if (primaryKeyColumns.length > 0) {
        // Create composite key from all primary key columns
        const pkValues = primaryKeyColumns
          .map((col) => {
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
      data: filteredData,
      columns,
      getRowId,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: "includesString" as const,
      state: {
        sorting,
        columnVisibility,
        rowSelection,
        globalFilter,
      },
      // Ensure selection is preserved across data changes
      enableRowSelection: true,
      enableMultiRowSelection: true,
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
      .rows.map((row) => row.original);

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
          title: "Sucesso",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro ao Deletar",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao Deletar",
        description: "Erro inesperado ao deletar linhas.",
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
      tableRowCount,
      filteredRowCount,
      columnCount,
      editingCellsCount,
      isLargeDataset: tableRowCount > 1000,
      filteringActive: columnFilters.length > 0 || globalFilter.length > 0,
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
      tables.filter((table) =>
        table.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [tables, searchTerm]
  );

  // Memoized row count information
  const rowCountInfo = useMemo(
    () => ({
      filtered: table.getFilteredRowModel().rows.length,
      total: table.getCoreRowModel().rows.length,
      selected: Object.keys(rowSelection).length,
    }),
    [table, rowSelection]
  );

  // Memoized action button props
  const actionButtonProps = useMemo(
    () => ({
      hasSelectedRows: Object.keys(rowSelection).length > 0,
      selectedCount: Object.keys(rowSelection).length,
      canRefresh: !!selectedTable && !isLoadingData,
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
        <pre className="p-4 text-sm whitespace-pre-wrap bg-muted/50 rounded-md">
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
              {queryResult.columns.map((col) => (
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
            {queryResult.rows.map((row, rowIndex) => {
              // Generate a unique key based on first column value + row index for better uniqueness
              const firstCol = queryResult.columns?.[0];
              const firstValue = firstCol
                ? String(row[firstCol.name] ?? "")
                : "";
              const rowKey = `query-result-${firstValue}-${rowIndex}`;
              return (
                <TableRow key={rowKey}>
                  {queryResult.columns?.map((col) => (
                    <TableCell
                      key={`${rowKey}-${col.name}`}
                      className="whitespace-nowrap max-w-xs truncate"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{String(row[col.name] ?? "")}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-md break-all whitespace-pre-wrap">
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
          title: "Sucesso",
          description: "Nova linha adicionada com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao Adicionar Linha",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao Adicionar Linha",
        description: "Erro inesperado ao adicionar linha.",
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
          name: "",
          type: "VARCHAR(255)",
          isNullable: true,
          defaultValue: "",
        });
        setShowAddColumnDialog(false);
        toast({
          title: "Sucesso",
          description: "Nova coluna adicionada com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao Adicionar Coluna",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao Adicionar Coluna",
        description: "Erro inesperado ao adicionar coluna.",
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
            title: "Sucesso",
            description: "Coluna removida com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao Remover Coluna",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao Remover Coluna",
          description: "Erro inesperado ao remover coluna.",
          variant: "destructive",
        });
      }
    },
    [selectedTable, instanceId, fetchTableData]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Tables and Query */}
        <Card className="lg:w-1/3 xl:w-1/4 shadow-xl border-border/50 bg-card/60 backdrop-blur-md flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ListTree className="h-5 w-5 mr-2 text-primary" />
              Tabelas ({domainName})
            </CardTitle>
            <Input
              placeholder="Buscar tabelas..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="mt-2 bg-background/70"
            />
          </CardHeader>
          <CardContent className="pr-0 flex-grow overflow-hidden">
            {isLoadingTables ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error && tables.length === 0 ? (
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
                      className={`w-full justify-start mb-1 text-left h-auto py-2 ${
                        selectedTable === table
                          ? "bg-primary/20 text-primary-foreground hover:bg-primary/30"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleTableSelect(table)}
                    >
                      {table}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm p-4 text-center">
                    Nenhuma tabela encontrada
                    {searchTerm && " correspondente à sua busca"}.
                  </p>
                )}
              </ScrollArea>
            )}
          </CardContent>

          {/* Query Section */}
          <div className="border-t mt-auto p-4 space-y-3">
            <h3 className="flex items-center text-md font-semibold">
              <Edit3 className="h-5 w-5 mr-2 text-primary" />
              Consulta Personalizada
            </h3>
            <textarea
              value={query}
              onChange={handleQueryChange}
              placeholder="SELECT * FROM sua_tabela WHERE condicao;"
              className="w-full h-28 p-2 border rounded-md bg-background/70 focus:ring-1 focus:ring-primary text-sm resize-none"
            />
            <Button
              onClick={handleQueryExecute}
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

        {/* Main Content - Table Editor */}
        <Card className="lg:w-2/3 xl:w-3/4 flex-grow shadow-xl border-border/50 bg-card/60 backdrop-blur-md flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center text-xl">
                  {selectedTable ? (
                    <>
                      <DatabaseZap className="h-6 w-6 mr-2 text-primary" />
                      Editando:
                      <span className="font-mono ml-2 px-2 py-1 bg-muted/70 rounded-md text-sm">
                        {selectedTable}
                      </span>
                    </>
                  ) : queryResult ? (
                    <>
                      <Search className="h-6 w-6 mr-2 text-primary" />
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
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddRowDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova Linha
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddColumnDialog(true)}
                  >
                    <Columns3 className="h-4 w-4 mr-1" />
                    Nova Coluna
                  </Button>

                  {actionButtonProps.hasSelectedRows && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteDialogOpen}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Deletar ({actionButtonProps.selectedCount})
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSchemaDialogOpen}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Esquema
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTableRefresh}
                    disabled={!actionButtonProps.canRefresh}
                  >
                    <RotateCcw
                      className={`h-4 w-4 mr-1 ${isLoadingData ? "animate-spin" : ""}`}
                    />
                    Atualizar
                  </Button>
                </div>
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
                    .replace(/^Falha na consulta: /i, "")}
                </p>
              </div>
            ) : queryResult ? (
              <ScrollArea className="h-full p-4 border-t">
                {renderQueryResult()}
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            ) : selectedTable && tableColumns.length > 0 ? (
              <div className="h-full border-t">
                {/* Global Search */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Busca global..."
                        value={globalFilter ?? ""}
                        onChange={handleGlobalFilterChange}
                        className="max-w-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {rowCountInfo.filtered} de {rowCountInfo.total} linhas
                      </span>
                      {rowCountInfo.selected > 0 && (
                        <span className="text-sm text-primary font-medium">
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
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="whitespace-nowrap p-2"
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
                          .rows.map((row) => (
                            <TableRowItem
                              key={row.id}
                              row={row}
                              columns={columns}
                            />
                          ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                              <FaCircleInfo className="h-8 w-8 mb-2" />
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
              <div className="text-muted-foreground p-6 text-center flex flex-col items-center justify-center h-full">
                <Search className="h-10 w-10 mb-3 text-muted-foreground/60" />
                <p className="font-semibold text-lg mb-1">
                  Nenhuma Coluna Encontrada
                </p>
                <p className="text-sm">
                  Não foi possível determinar as colunas para {selectedTable}.
                  Pode estar vazia ou ser de um tipo não suportado.
                </p>
              </div>
            ) : (
              <div className="text-muted-foreground p-6 text-center flex flex-col items-center justify-center h-full">
                <DatabaseZap className="h-12 w-12 mb-4 text-muted-foreground/60" />
                <p className="text-lg font-medium">
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
      <Dialog open={showSchemaDialog} onOpenChange={setShowSchemaDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                <h3 className="text-lg font-semibold mb-3">Colunas</h3>
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
                    {tableSchema.columns.map((col) => (
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
                            <Badge variant="default" className="mr-1">
                              <Key className="h-3 w-3 mr-1" />
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
                  <h3 className="text-lg font-semibold mb-3">
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
                              variant="link"
                              className="h-auto p-0"
                              onClick={() => {
                                setSelectedTable(fk.referencedTable);
                                setShowSchemaDialog(false);
                              }}
                            >
                              {fk.referencedTable}
                              <ExternalLink className="h-3 w-3 ml-1" />
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
                  <h3 className="text-lg font-semibold mb-3">Índices</h3>
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
            <Button variant="outline" onClick={handleDeleteDialogClose}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Row Dialog */}
      <Dialog open={showAddRowDialog} onOpenChange={setShowAddRowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Linha</DialogTitle>
            <DialogDescription>
              Preencha os valores para a nova linha na tabela {selectedTable}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {tableColumns.map((col) => (
              <div key={col.name} className="space-y-2">
                <Label htmlFor={`new-row-${col.name}`}>
                  {col.name}
                  {col.isPrimaryKey && (
                    <Key className="h-3 w-3 inline ml-1 text-yellow-500" />
                  )}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {col.type}
                  </Badge>
                </Label>
                <Input
                  id={`new-row-${col.name}`}
                  placeholder={col.isNullable ? "Opcional" : "Obrigatório"}
                  value={newRowData[col.name] || ""}
                  onChange={(e) =>
                    setNewRowData((prev) => ({
                      ...prev,
                      [col.name]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddRowDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddRowSubmit}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Column Dialog */}
      <Dialog open={showAddColumnDialog} onOpenChange={setShowAddColumnDialog}>
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
                placeholder="nome_da_coluna"
                value={newColumnForm.name}
                onChange={(e) =>
                  setNewColumnForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="column-type">Tipo de Dados</Label>
              <Select
                value={newColumnForm.type}
                onValueChange={(value) =>
                  setNewColumnForm((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
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
                id="column-nullable"
                checked={newColumnForm.isNullable}
                onCheckedChange={(checked) =>
                  setNewColumnForm((prev) => ({
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
                placeholder="NULL"
                value={newColumnForm.defaultValue}
                onChange={(e) =>
                  setNewColumnForm((prev) => ({
                    ...prev,
                    defaultValue: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddColumnDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddColumnSubmit}
              disabled={!newColumnForm.name.trim()}
            >
              <Columns3 className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
