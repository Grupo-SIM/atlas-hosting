import {
  ChevronDown,
  ChevronRight,
  Columns,
  Database,
  Edit3,
  PlusCircle,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WpCliApi } from "@/lib/server/apis/plesk/wp-toolkit/wp-cli"; // Adjust path as needed

interface DatabaseViewerProps {
  wpCliDb: WpCliApi["db"];
  instanceId: number;
}

interface TableData {
  headers: string[];
  rows: (string | number | null)[][];
}

const ITEMS_PER_PAGE = 15;

export function DatabaseViewer({ wpCliDb, instanceId }: DatabaseViewerProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colIndex: number;
    originalValue: any;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  useEffect(() => {
    fetchTables();
  }, [wpCliDb]);

  const fetchTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // The 'tables' method in DbCommand returns a string, which needs parsing.
      // It might be a newline-separated list or space-separated.
      const tablesString = await wpCliDb.tables({ format: "list" });
      setTables(tablesString.split(/\s+/).filter(Boolean)); // Split by whitespace and remove empty strings
    } catch (e: any) {
      setError(`Erro ao buscar tabelas: ${e.message}`);
      setTables([]);
    }
    setIsLoading(false);
  };

  const fetchTableData = async (tableName: string, page = 1, search = "") => {
    if (!tableName) return;
    setIsLoading(true);
    setError(null);
    setTableData(null);
    setCurrentPage(page);

    try {
      // DbCommand.query might be the most flexible way to get paginated/searched data.
      // This is a simplified example; actual SQL might need to be more complex.
      let query = `SELECT * FROM ${tableName}`;
      if (search) {
        // This is a very basic search, real implementation would need to identify column names and types
        // and build a more robust WHERE clause.
        // For now, let's assume we search in the first column if it's a string type (pseudo-code)
        // const columns = await wpCliDb.columns({table: tableName, format: 'json'}) // Fictional method, or parse from another query
        // if (columns && columns.length > 0 && typeof columns[0].type === 'string') {
        // query += ` WHERE ${columns[0].name} LIKE '%${search}%'`
        // }
        // As a placeholder, this won't actually filter effectively without knowing column names:
        // query += ` WHERE CAST(id AS TEXT) LIKE '%${search}%'`; // Example, assuming an 'id' column
      }
      query += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${(page - 1) * ITEMS_PER_PAGE}`;

      // The query method likely returns a string that needs to be parsed.
      // The format (CSV, JSON, etc.) would depend on how wp-cli outputs it and how `execute` handles it.
      // Assuming it can return a JSON string representation of the table or similar parsable format.
      const resultString = await wpCliDb.query(query, { format: "json" }); // Assuming format 'json' gives a parsable output

      let parsedResult;
      try {
        parsedResult = JSON.parse(resultString);
      } catch (parseError) {
        // If JSON.parse fails, it might be a different format or an error message string.
        // Fallback: try to parse as simple CSV-like structure if it's a plain string table.
        // This is highly dependent on the actual output of wpCliDb.query
        const rows = resultString.trim().split("\n");
        const headers = rows.length > 0 ? rows[0].split("\t") : []; // Assuming tab-separated
        const dataRows = rows.slice(1).map(row => row.split("\t"));
        if (headers.length > 0 && dataRows.length > 0) {
          setTableData({ headers, rows: dataRows });
        } else {
          throw new Error("Formato de dados não reconhecido ou tabela vazia.");
        }
        return;
      }

      if (Array.isArray(parsedResult) && parsedResult.length > 0) {
        const headers = Object.keys(parsedResult[0]);
        const rows = parsedResult.map(row =>
          headers.map(header => row[header])
        );
        setTableData({ headers, rows });
      } else if (
        parsedResult &&
        typeof parsedResult === "object" &&
        !Array.isArray(parsedResult)
      ) {
        // Handle single object result if that's possible
        const headers = Object.keys(parsedResult);
        const rows = [headers.map(header => parsedResult[header])];
        setTableData({ headers, rows });
      } else {
        setTableData({ headers: [], rows: [] });
      }
    } catch (e: any) {
      setError(`Erro ao buscar dados da tabela ${tableName}: ${e.message}`);
      setTableData(null);
    }
    setIsLoading(false);
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSearchTerm("");
    fetchTableData(tableName, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (selectedTable) {
      fetchTableData(selectedTable, newPage, searchTerm);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (selectedTable) {
      fetchTableData(selectedTable, 1, searchTerm);
    }
  };

  const handleEditCell = (rowIndex: number, colIndex: number, value: any) => {
    setEditingCell({ colIndex, originalValue: value, rowIndex });
    setEditValue(String(value));
  };

  const handleSaveEdit = async () => {
    if (!editingCell || !selectedTable || !tableData) return;

    const { rowIndex, colIndex, originalValue } = editingCell;
    const header = tableData.headers[colIndex];
    // This assumes there's an identifiable primary key, e.g., 'ID' or the first column.
    // This is a major simplification. Realistically, you need to know the primary key.
    const primaryKeyColumn = tableData.headers[0];
    const primaryKeyValue = tableData.rows[rowIndex][0];

    if (primaryKeyValue === null || primaryKeyValue === undefined) {
      setError(
        "Não é possível atualizar a linha: valor da chave primária ausente."
      );
      setEditingCell(null);
      return;
    }

    setIsLoading(true);
    try {
      // IMPORTANT: WP-CLI db query does not directly support UPDATE in a way that returns structured output easily.
      // db search-replace might be an option for specific, simple cases, but not for general cell editing.
      // A more robust solution would involve a dedicated backend endpoint that constructs and executes precise SQL UPDATE statements.
      // The following is a conceptual representation and might not work directly or safely.
      // It's highly recommended to implement updates via a secure server-side API call.
      const updateQuery = `UPDATE ${selectedTable} SET ${header} = '${editValue.replace(/'/g, "''")}' WHERE ${primaryKeyColumn} = '${String(primaryKeyValue).replace(/'/g, "''")}'`;
      await wpCliDb.query(updateQuery); // This might just return success/error message as string

      // Optimistically update UI or refetch data
      if (tableData) {
        const updatedRows = [...tableData.rows];
        updatedRows[rowIndex][colIndex] = editValue;
        setTableData({ ...tableData, rows: updatedRows });
      }
      setEditingCell(null);
    } catch (e: any) {
      setError(`Erro ao atualizar célula: ${e.message}`);
    }
    setIsLoading(false);
  };

  const handleDeleteRow = async (rowIndex: number) => {
    if (!selectedTable || !tableData) return;
    const primaryKeyColumn = tableData.headers[0];
    const primaryKeyValue = tableData.rows[rowIndex][0];

    if (primaryKeyValue === null || primaryKeyValue === undefined) {
      setError(
        "Não é possível excluir a linha: valor da chave primária ausente."
      );
      return;
    }

    if (
      window.confirm(
        `Tem certeza que deseja excluir esta linha da tabela ${selectedTable} onde ${primaryKeyColumn} = ${primaryKeyValue}? Esta ação é irreversível.`
      )
    ) {
      setIsLoading(true);
      try {
        const deleteQuery = `DELETE FROM ${selectedTable} WHERE ${primaryKeyColumn} = '${String(primaryKeyValue).replace(/'/g, "''")}'`;
        await wpCliDb.query(deleteQuery);
        // Refetch data for the current table and page
        fetchTableData(selectedTable, currentPage, searchTerm);
      } catch (e: any) {
        setError(`Erro ao excluir linha: ${e.message}`);
      }
      setIsLoading(false);
    }
  };

  const totalPages = tableData?.rows
    ? Math.ceil(tableData.rows.length / ITEMS_PER_PAGE)
    : 1; // This is incorrect if pagination is server-side
  // For server-side pagination, you'd need a total count from the server.
  // Let's assume for now the query LIMIT works and we only get one page of data.
  // So, pagination controls might not reflect total server-side pages accurately without more info.

  return (
    <Card className="overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white shadow-2xl">
      <CardHeader className="border-slate-700 border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-400" />
            <CardTitle className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text font-bold text-2xl text-transparent tracking-tight">
              Visualizador de Banco de Dados
            </CardTitle>
          </div>
          <Button
            className="border-slate-600 text-sm hover:bg-slate-700"
            disabled={isLoading}
            onClick={fetchTables}
            variant="outline"
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Recarregar Tabelas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <h3 className="mb-2 flex items-center font-semibold text-lg text-slate-300">
              <Columns className="mr-2 h-5 w-5 text-teal-400" /> Tabelas
            </h3>
            {isLoading && tables.length === 0 && (
              <p className="text-slate-400">Carregando tabelas...</p>
            )}
            {error && tables.length === 0 && (
              <p className="text-red-400">{error}</p>
            )}
            <div className="max-h-96 space-y-1 overflow-y-auto pr-2">
              {tables.map(table => (
                <Button
                  className={`w-full justify-start text-left ${selectedTable === table ? "bg-blue-600 text-white hover:bg-blue-500" : "text-slate-300 hover:bg-slate-700"}`}
                  key={table}
                  onClick={() => handleTableSelect(table)}
                  variant={selectedTable === table ? "secondary" : "ghost"}
                >
                  {selectedTable === table ? (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="mr-2 h-4 w-4 opacity-0 group-hover:opacity-100" />
                  )}
                  {table}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:col-span-3">
            {selectedTable ? (
              <>
                <div className="flex items-center justify-between gap-4 border-slate-700 border-b pb-4">
                  <h3 className="truncate font-semibold text-slate-200 text-xl">
                    Visualizando:{" "}
                    <span className="text-teal-400">{selectedTable}</span>
                  </h3>
                  {/* Add actions like add row, filter, etc. here */}
                  <Button
                    className="border-slate-600 text-sm hover:bg-slate-700"
                    size="sm"
                    variant="outline"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Linha (Não
                    implementado)
                  </Button>
                </div>

                {/* Search functionality - basic */}
                <div className="mb-4 flex gap-2">
                  <Input
                    className="border-slate-600 bg-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    onChange={handleSearchChange}
                    placeholder="Buscar na tabela (funcionalidade limitada)..."
                    type="search"
                    value={searchTerm}
                  />
                  <Button
                    className="bg-blue-600 hover:bg-blue-500"
                    disabled={isLoading || !selectedTable}
                    onClick={handleSearchSubmit}
                  >
                    <Search className="mr-2 h-4 w-4" /> Buscar
                  </Button>
                </div>

                {isLoading && !tableData && (
                  <p className="py-8 text-center text-slate-400">
                    Carregando dados da tabela...
                  </p>
                )}
                {error && !tableData && (
                  <p className="py-8 text-center text-red-400">{error}</p>
                )}

                {tableData && (
                  <>
                    {tableData.rows.length === 0 && !isLoading && (
                      <div className="py-10 text-center text-slate-500">
                        <Search className="mx-auto mb-3 h-12 w-12 opacity-50" />
                        <p className="text-lg">
                          Nenhum dado encontrado para{" "}
                          <span className="font-medium text-slate-400">
                            {selectedTable}
                          </span>
                          .
                        </p>
                        <p className="text-sm">
                          Tente um termo de busca diferente ou verifique a
                          tabela.
                        </p>
                      </div>
                    )}
                    {tableData.rows.length > 0 && (
                      <div className="overflow-x-auto rounded-md border border-slate-700 bg-slate-800/50">
                        <Table className="min-w-full">
                          <TableHeader className="bg-slate-700/50">
                            <TableRow className="hover:bg-slate-700/70">
                              {tableData.headers.map(header => (
                                <TableHead
                                  className="whitespace-nowrap p-3 font-medium text-slate-400 text-xs uppercase tracking-wider"
                                  key={header}
                                >
                                  {header}
                                </TableHead>
                              ))}
                              <TableHead className="whitespace-nowrap p-3 text-right font-medium text-slate-400 text-xs uppercase tracking-wider">
                                Ações
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-slate-700">
                            {tableData.rows.map((row, rowIndex) => (
                              <TableRow
                                className="transition-colors hover:bg-slate-700/30"
                                key={rowIndex}
                              >
                                {row.map((cell, colIndex) => (
                                  <TableCell
                                    className="whitespace-nowrap p-3 text-slate-300 text-sm"
                                    key={colIndex}
                                  >
                                    {editingCell?.rowIndex === rowIndex &&
                                    editingCell?.colIndex === colIndex ? (
                                      <div className="flex items-center gap-1">
                                        <Input
                                          autoFocus
                                          className="h-8 border-slate-500 bg-slate-600 text-sm"
                                          onChange={e =>
                                            setEditValue(e.target.value)
                                          }
                                          onKeyDown={e =>
                                            e.key === "Enter" &&
                                            handleSaveEdit()
                                          }
                                          type="text"
                                          value={editValue}
                                        />
                                        <Button
                                          className="h-8 w-8 text-green-400 hover:bg-green-500/20"
                                          onClick={handleSaveEdit}
                                          size="icon"
                                          variant="ghost"
                                        >
                                          <Save className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                                          onClick={() => setEditingCell(null)}
                                          size="icon"
                                          variant="ghost"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <span
                                        className="block max-w-xs truncate"
                                        onClick={() =>
                                          handleEditCell(
                                            rowIndex,
                                            colIndex,
                                            cell
                                          )
                                        }
                                        title={String(cell)}
                                      >
                                        {cell === null ? (
                                          <em className="text-slate-500">
                                            NULL
                                          </em>
                                        ) : (
                                          String(cell)
                                        )}
                                      </span>
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell className="whitespace-nowrap p-3 text-right text-sm">
                                  <Button
                                    className="mr-1 h-8 w-8 text-blue-400 hover:bg-blue-500/20"
                                    onClick={() =>
                                      handleEditCell(
                                        rowIndex,
                                        0,
                                        tableData.rows[rowIndex][0]
                                      )
                                    }
                                    size="icon"
                                    title="Editar Linha (inicia pela primeira célula)"
                                    variant="ghost"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    className="h-8 w-8 text-red-400 hover:bg-red-500/20"
                                    onClick={() => handleDeleteRow(rowIndex)}
                                    size="icon"
                                    title="Excluir Linha"
                                    variant="ghost"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Pagination - basic, assuming server-side handles actual slicing */}
                    {tableData.rows.length > 0 && (
                      <div className="mt-4 flex items-center justify-between border-slate-700 border-t pt-4">
                        <Button
                          className="border-slate-600 text-sm hover:bg-slate-700"
                          disabled={currentPage === 1 || isLoading}
                          onClick={() => handlePageChange(currentPage - 1)}
                          variant="outline"
                        >
                          Anterior
                        </Button>
                        <span className="text-slate-400 text-sm">
                          Página {currentPage}
                        </span>
                        <Button
                          className="border-slate-600 text-sm hover:bg-slate-700"
                          disabled={
                            tableData.rows.length < ITEMS_PER_PAGE || isLoading
                          } // Disable if not a full page, implying end
                          onClick={() => handlePageChange(currentPage + 1)}
                          variant="outline"
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-500">
                <Database className="mb-6 h-20 w-20 opacity-30" />
                <h3 className="mb-2 font-semibold text-slate-400 text-xl">
                  Selecione uma Tabela
                </h3>
                <p className="max-w-sm">
                  Escolha uma tabela na lista à esquerda para visualizar e
                  editar seus dados. As operações de edição são limitadas e
                  devem ser usadas com cautela.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
