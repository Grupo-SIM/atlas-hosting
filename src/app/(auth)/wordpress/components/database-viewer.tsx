import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Database, Edit3, Save, Search, Trash2, X, PlusCircle, Columns, Filter, RefreshCcw } from 'lucide-react';
import { WpCliApi } from '@/lib/server/apis/plesk/wp-toolkit/wp-cli'; // Adjust path as needed
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DatabaseViewerProps {
  wpCliDb: WpCliApi['db'];
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
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number; originalValue: any } | null>(null);
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
      const tablesString = await wpCliDb.tables({ format: 'list' });
      setTables(tablesString.split(/\s+/).filter(Boolean)); // Split by whitespace and remove empty strings
    } catch (e: any) {
      setError(`Erro ao buscar tabelas: ${e.message}`);
      setTables([]);
    }
    setIsLoading(false);
  };

  const fetchTableData = async (tableName: string, page = 1, search = '') => {
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
      const resultString = await wpCliDb.query(query, { format: 'json' }); // Assuming format 'json' gives a parsable output
      
      let parsedResult;
      try {
        parsedResult = JSON.parse(resultString);
      } catch (parseError) {
        // If JSON.parse fails, it might be a different format or an error message string.
        // Fallback: try to parse as simple CSV-like structure if it's a plain string table.
        // This is highly dependent on the actual output of wpCliDb.query
        const rows = resultString.trim().split('\n');
        const headers = rows.length > 0 ? rows[0].split('\t') : []; // Assuming tab-separated
        const dataRows = rows.slice(1).map(row => row.split('\t'));
        if(headers.length > 0 && dataRows.length > 0) {
            setTableData({ headers, rows: dataRows });
        } else {
            throw new Error('Formato de dados não reconhecido ou tabela vazia.');
        }
        return;
      }

      if (Array.isArray(parsedResult) && parsedResult.length > 0) {
        const headers = Object.keys(parsedResult[0]);
        const rows = parsedResult.map(row => headers.map(header => row[header]));
        setTableData({ headers, rows });
      } else if (parsedResult && typeof parsedResult === 'object' && !Array.isArray(parsedResult)){
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
    setSearchTerm('');
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
    setEditingCell({ rowIndex, colIndex, originalValue: value });
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
        setError("Não é possível atualizar a linha: valor da chave primária ausente.");
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
        setError("Não é possível excluir a linha: valor da chave primária ausente.");
        return;
    }

    if (window.confirm(`Tem certeza que deseja excluir esta linha da tabela ${selectedTable} onde ${primaryKeyColumn} = ${primaryKeyValue}? Esta ação é irreversível.`)) {
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

  const totalPages = tableData?.rows ? Math.ceil(tableData.rows.length / ITEMS_PER_PAGE) : 1; // This is incorrect if pagination is server-side
  // For server-side pagination, you'd need a total count from the server.
  // Let's assume for now the query LIMIT works and we only get one page of data.
  // So, pagination controls might not reflect total server-side pages accurately without more info.

  return (
    <Card className="shadow-2xl rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white">
      <CardHeader className="border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
                <Database className="h-8 w-8 text-blue-400" />
                <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                    Visualizador de Banco de Dados
                </CardTitle>
            </div>
            <Button variant="outline" onClick={fetchTables} disabled={isLoading} className="text-sm border-slate-600 hover:bg-slate-700">
                <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Recarregar Tabelas
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 mb-2 flex items-center">
                <Columns className="h-5 w-5 mr-2 text-teal-400"/> Tabelas
            </h3>
            {isLoading && tables.length === 0 && <p className="text-slate-400">Carregando tabelas...</p>}
            {error && tables.length === 0 && <p className="text-red-400">{error}</p>}
            <div className="max-h-96 overflow-y-auto space-y-1 pr-2">
                {tables.map(table => (
                    <Button
                    key={table}
                    variant={selectedTable === table ? "secondary" : "ghost"}
                    onClick={() => handleTableSelect(table)}
                    className={`w-full justify-start text-left ${selectedTable === table ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                    >
                    {selectedTable === table ? <ChevronRight className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100" />}
                    {table}
                    </Button>
                ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            {selectedTable ? (
              <>
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-200 truncate">
                        Visualizando: <span className='text-teal-400'>{selectedTable}</span>
                    </h3>
                    {/* Add actions like add row, filter, etc. here */}
                    <Button variant="outline" size="sm" className="text-sm border-slate-600 hover:bg-slate-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Linha (Não implementado)
                    </Button>
                </div>
                
                {/* Search functionality - basic */}
                <div className="flex gap-2 mb-4">
                  <Input 
                    type="search"
                    placeholder="Buscar na tabela (funcionalidade limitada)..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-slate-700 border-slate-600 placeholder-slate-500 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button onClick={handleSearchSubmit} disabled={isLoading || !selectedTable} className="bg-blue-600 hover:bg-blue-500">
                    <Search className="mr-2 h-4 w-4" /> Buscar
                  </Button>
                </div>

                {isLoading && !tableData && <p className="text-center text-slate-400 py-8">Carregando dados da tabela...</p>}
                {error && !tableData && <p className="text-red-400 text-center py-8">{error}</p>}
                
                {tableData && (
                  <>
                    {tableData.rows.length === 0 && !isLoading && (
                        <div className="text-center py-10 text-slate-500">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg">Nenhum dado encontrado para <span className='font-medium text-slate-400'>{selectedTable}</span>.</p>
                            <p className='text-sm'>Tente um termo de busca diferente ou verifique a tabela.</p>
                        </div>
                    )}
                    {tableData.rows.length > 0 && (
                        <div className="overflow-x-auto rounded-md border border-slate-700 bg-slate-800/50">
                        <Table className="min-w-full">
                            <TableHeader className="bg-slate-700/50">
                            <TableRow className="hover:bg-slate-700/70">
                                {tableData.headers.map(header => (
                                <TableHead key={header} className="p-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">{header}</TableHead>
                                ))}
                                <TableHead className="p-3 text-xs font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap text-right">Ações</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-700">
                            {tableData.rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className="hover:bg-slate-700/30 transition-colors">
                                {row.map((cell, colIndex) => (
                                    <TableCell key={colIndex} className="p-3 text-sm text-slate-300 whitespace-nowrap">
                                    {editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex ? (
                                        <div className="flex items-center gap-1">
                                        <Input 
                                            type="text" 
                                            value={editValue} 
                                            onChange={(e) => setEditValue(e.target.value)} 
                                            autoFocus
                                            className="bg-slate-600 border-slate-500 h-8 text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} 
                                        />
                                        <Button size="icon" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 hover:bg-green-500/20 text-green-400">
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => setEditingCell(null)} className="h-8 w-8 hover:bg-red-500/20 text-red-400">
                                            <X className="h-4 w-4" />
                                        </Button>
                                        </div>
                                    ) : (
                                        <span className="block max-w-xs truncate" title={String(cell)} onClick={() => handleEditCell(rowIndex, colIndex, cell)}>
                                        {cell === null ? <em className='text-slate-500'>NULL</em> : String(cell)}
                                        </span>
                                    )}
                                    </TableCell>
                                ))}
                                <TableCell className="p-3 text-sm text-right whitespace-nowrap">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-500/20 text-blue-400 mr-1" onClick={() => handleEditCell(rowIndex, 0, tableData.rows[rowIndex][0])} title="Editar Linha (inicia pela primeira célula)">
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/20 text-red-400" onClick={() => handleDeleteRow(rowIndex)} title="Excluir Linha">
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
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700">
                        <Button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1 || isLoading}
                            variant="outline"
                            className="text-sm border-slate-600 hover:bg-slate-700"
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-slate-400">Página {currentPage}</span>
                        <Button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={tableData.rows.length < ITEMS_PER_PAGE || isLoading} // Disable if not a full page, implying end
                            variant="outline"
                            className="text-sm border-slate-600 hover:bg-slate-700"
                        >
                            Próxima
                        </Button>
                        </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12">
                <Database className="h-20 w-20 opacity-30 mb-6" />
                <h3 className="text-xl font-semibold mb-2 text-slate-400">Selecione uma Tabela</h3>
                <p className="max-w-sm">
                  Escolha uma tabela na lista à esquerda para visualizar e editar seus dados.
                  As operações de edição são limitadas e devem ser usadas com cautela.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
