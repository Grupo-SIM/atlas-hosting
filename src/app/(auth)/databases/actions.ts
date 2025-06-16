"use server";

import WpCliApi from "@/lib/server/apis/plesk/wp-toolkit/wp-cli";
import type {
  DbTablesOptions,
  DbQueryOptions,
} from "@/lib/server/apis/plesk/wp-toolkit/wp-cli"; // Assuming these types are exported

// Define a more specific type for table row data if possible, for now, keep it generic
export type TableRowData = Record<string, unknown>;
export type TableColumn = { 
  name: string; 
  type: string; 
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
  extra?: string;
};

export interface TableDataResult {
  columns: TableColumn[];
  rows: TableRowData[];
}

export async function getDbTablesAction(
  instanceId: number,
  options?: DbTablesOptions
): Promise<string[]> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const tablesString = await wpCli.db.tables(options);
    // WP-CLI `db tables` with csv format might return a simple newline-separated string
    // For consistency with common CSV/TSV parsing, splitting by newline first, then by comma if necessary.
    // However, `wp db tables --format=csv` should produce comma-separated values on a single line or multiple lines if output is long.
    // If it's truly one table name per line without commas (like `ls`), then splitting by newline is correct.
    // Assuming `wp db tables --format=csv` gives "table1,table2,table3"
    // If `options` is undefined or doesn't set `format`, it's newline-separated.
    // The `DbTablesOptions` should ideally control this. If `options.format` is 'csv', it's comma. Otherwise, newline.
    // For now, let's assume if options.format === "csv", it's comma, else newline.
    if (options?.format === "csv") {
      return tablesString.split(",").filter(Boolean);
    }
    return tablesString.split("\n").filter(Boolean); // Default to newline separation
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Error in getDbTablesAction for instance ${instanceId}:`,
      error
    );
    throw new Error(`Falha ao buscar tabelas do banco de dados: ${message}`);
  }
}

export async function getDbTableDataAction(
  instanceId: number,
  tableName: string
): Promise<TableDataResult> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const result: TableDataResult = { columns: [], rows: [] };

    // Fetch columns using DESCRIBE
    try {
      const describeQuery = `DESCRIBE \`${tableName}\``; // Corrected backtick escaping
      const describeOutput = await wpCli.db.query(describeQuery);
      
      if (typeof describeOutput === "string" && describeOutput.trim() !== "") {
        const lines = describeOutput.trim().split("\n");
        if (lines.length > 1) {
          const headers = lines[0].split("\t");
          const fieldIndex = headers.indexOf("Field");
          const typeIndex = headers.indexOf("Type");
          const keyIndex = headers.indexOf("Key");

          if (fieldIndex !== -1 && typeIndex !== -1) {
            result.columns = lines.slice(1).map(line => {
              const values = line.split("\t");
              return {
                name: values[fieldIndex],
                type: values[typeIndex],
                isPrimaryKey: keyIndex !== -1 && values[keyIndex] === "PRI",
              };
            });
          } else {
            console.warn(`Could not find 'Field' or 'Type' headers in DESCRIBE output for table: ${tableName}`);
          }
        } else {
           console.warn(`DESCRIBE output for table has insufficient lines: ${tableName}`);
        }
      } else {
        console.warn(`DESCRIBE output for table was empty or not a string: ${tableName}`);
      }
    } catch (describeError: unknown) {
      const message = describeError instanceof Error ? describeError.message : String(describeError);
      console.error(
        `Error fetching column descriptions for ${tableName} on instance ${instanceId}:`,
        message
      );
      // If DESCRIBE fails, columns will be empty. Data parsing will be affected.
    }

    // Fetch actual data (TSV format)
    const dataQuery = `SELECT * FROM \`${tableName}\` LIMIT 50`; // Corrected backtick escaping
    const dataString = await wpCli.db.query(dataQuery);

    let parsedData: TableRowData[] = [];
    if (typeof dataString === "string" && dataString.trim() !== "") {
      const lines = dataString.trim().split("\n");
      if (lines.length > 1) {
        // Skip the first line as it contains column headers, not data
        const dataRows = lines.slice(1); 

        if (result.columns.length > 0) {
          parsedData = dataRows.map(line => {
            const values = line.split("\t");
            const row: TableRowData = {};
            result.columns.forEach((col, index) => {
              row[col.name] = values[index] !== undefined ? values[index] : null;
            });
            return row;
          });
        } else {
          console.warn(`Cannot parse rows for ${tableName} because column information is missing (DESCRIBE likely failed). Data will be empty.`);
        }
      }
    } else if (typeof dataString === "string" && dataString.trim() === "") {
      console.log(`No data returned for table ${tableName}.`);
    } else {
      console.warn(`dataString for ${tableName} was not a string or was unexpectedly empty. Type: ${typeof dataString}, Value: "${dataString}"`);
    }
    
    result.rows = parsedData;

    // Final check: if columns are empty but we somehow got rows, clear rows.
    if (result.columns.length === 0 && result.rows.length > 0) {
      console.warn(
        `Table ${tableName} has data rows but column structure could not be determined. Clearing rows to prevent inconsistency.`
      );
      result.rows = []; 
    }
    
    // If DESCRIBE failed and the table isn't simply empty, log a warning.
    if (result.columns.length === 0 && !(typeof dataString === "string" && dataString.trim() === "")) {
        console.warn(`Failed to determine columns for table ${tableName}. Data shown might be incomplete or missing.`);
    }

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in getDbTableDataAction for table ${tableName}, instance ${instanceId}:`, error);
    throw new Error(
      `Falha ao buscar dados da tabela ${tableName}: ${message}`
    );
  }
}

export async function runDbQueryAction(
  instanceId: number,
  sql: string,
  options?: DbQueryOptions
): Promise<string> { // Return type is now always string
  try {
    const wpCli = new WpCliApi(instanceId);
    const rawResult = await wpCli.db.query(sql, options);

    if (typeof rawResult === "string") {
      return rawResult; // Always return the raw string output
    } 
    
    // This case should be rare, as wpCli.db.query is expected to return a string.
    console.warn(`runDbQueryAction: wpCli.db.query did not return a string. Type: ${typeof rawResult}. SQL: "${sql}"`);
    return String(rawResult); // Coerce to string if not already

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Error in runDbQueryAction for instance ${instanceId} with query "${sql.substring(0,100)}...":`,
      error
    );
    // Return the error message as a string to be displayed in the query result area
    return `Error executing query: ${message}`;
  }
}

// Helper function to escape SQL values
function escapeSqlValue(value: unknown): string {
  if (value === null || typeof value === "undefined") {
    return "NULL";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''")}'`;
  }
  return `'${String(value)}'`;
}

export async function updateTableRowAction(
  instanceId: number,
  tableName: string,
  primaryKeyColumns: TableColumn[],
  oldRowData: TableRowData,
  newRowData: TableRowData
): Promise<{ success: boolean; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const setClauses = Object.keys(newRowData)
      .map((key) => `\`${key}\` = ${escapeSqlValue(newRowData[key])}`)
      .join(", ");

    if (!setClauses) {
      return { success: false, message: "No data provided for update." };
    }

    let whereClauses = "";
    const pkColsInOldData = primaryKeyColumns.filter(col => col.isPrimaryKey && Object.prototype.hasOwnProperty.call(oldRowData, col.name));

    if (pkColsInOldData.length > 0) {
      whereClauses = pkColsInOldData
        .map(col => `\`${col.name}\` = ${escapeSqlValue(oldRowData[col.name])}`)
        .join(" AND ");
    } else {
      console.warn(`No primary key columns for update, using all columns in WHERE for table: ${tableName}`);
      whereClauses = Object.keys(oldRowData)
        .map((key) => `\`${key}\` = ${escapeSqlValue(oldRowData[key])}`)
        .join(" AND ");
    }
    
    if (!whereClauses) {
        return { success: false, message: "Cannot update row without a WHERE clause." };
    }

    const sql = `UPDATE \`${tableName}\` SET ${setClauses} WHERE ${whereClauses} LIMIT 1`;

    const result = await wpCli.db.query(sql);

    if (typeof result === "string" && (result.trim() === "" || /Rows matched: [1-9]\d* Changed: [1-9]\d*/.test(result) || /Query OK, [1-9]\d* row affected/.test(result) )) {
      return { success: true, message: "Row updated successfully." };
    }
    
    if (typeof result === "string") {
      return { success: false, message: `Update failed or no rows affected: ${result}` };
    }

    return { success: false, message: "Update failed: Unexpected response from server." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in updateTableRowAction for table ${tableName}:`, error);
    return { success: false, message: `Error updating row: ${message}` };
  }
}

export async function insertTableRowAction(
  instanceId: number,
  tableName: string,
  newRowData: TableRowData
): Promise<{ success: boolean; message: string; insertId?: string | number }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const columns = Object.keys(newRowData).map(key => `\`${key}\``).join(", ");
    const values = Object.values(newRowData).map(escapeSqlValue).join(", ");

    if (!columns || !values) {
        return { success: false, message: "No data provided for insert." };
    }

    const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values})`;
    const result = await wpCli.db.query(sql);

    if (typeof result === "string" && (result.trim() === "" || /Query OK, [1-9]\d* row affected/.test(result) || /1 row inserted./.test(result) )) {
      return { success: true, message: "Row inserted successfully." };
    }
    
    if (typeof result === "string") {
      return { success: false, message: `Insert failed: ${result}` };
    }
    
    return { success: false, message: "Insert failed: Unexpected response from server." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in insertTableRowAction for table ${tableName}:`, error);
    return { success: false, message: `Error inserting row: ${message}` };
  }
}

export async function deleteTableRowAction(
  instanceId: number,
  tableName: string,
  primaryKeyColumns: TableColumn[],
  rowDataToDelete: TableRowData
): Promise<{ success: boolean; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    let whereClauses = "";
    const pkColsInRowData = primaryKeyColumns.filter(col => col.isPrimaryKey && Object.prototype.hasOwnProperty.call(rowDataToDelete, col.name));

    if (pkColsInRowData.length > 0) {
      whereClauses = pkColsInRowData
        .map(col => `\`${col.name}\` = ${escapeSqlValue(rowDataToDelete[col.name])}`)
        .join(" AND ");
    } else {
      console.warn(`No primary key columns for delete, using all columns in WHERE for table: ${tableName}`);
      whereClauses = Object.keys(rowDataToDelete)
        .map((key) => `\`${key}\` = ${escapeSqlValue(rowDataToDelete[key])}`)
        .join(" AND ");
    }

    if (!whereClauses) {
        return { success: false, message: "Cannot delete row without a WHERE clause." };
    }

    const sql = `DELETE FROM \`${tableName}\` WHERE ${whereClauses} LIMIT 1`;

    const result = await wpCli.db.query(sql);

    if (typeof result === "string" && (result.trim() === "" || /Rows affected: [1-9]\d*/.test(result) || /Query OK, [1-9]\d* row affected/.test(result))) {
      return { success: true, message: "Row deleted successfully." };
    }
    
    if (typeof result === "string") {
      return { success: false, message: `Delete failed or no rows affected: ${result}` };
    }

    return { success: false, message: "Delete failed: Unexpected response from server." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in deleteTableRowAction for table ${tableName}:`, error);
    return { success: false, message: `Error deleting row: ${message}` };
  }
}

// Additional types for enhanced functionality
export interface TableSchema {
  tableName: string;
  columns: TableColumn[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  indexes: TableIndex[];
}

export interface ForeignKey {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  constraintName: string;
}

export interface TableIndex {
  indexName: string;
  columnName: string;
  isUnique: boolean;
  indexType: string;
}

export interface DatabaseInfo {
  name: string;
  tables: string[];
  size: string;
  charset: string;
  collation: string;
}

// Get comprehensive table schema information
export async function getTableSchemaAction(
  instanceId: number,
  tableName: string
): Promise<TableSchema> {
  try {
    const wpCli = new WpCliApi(instanceId);
    
    // Get basic column information
    const describeQuery = `DESCRIBE \`${tableName}\``;
    const describeOutput = await wpCli.db.query(describeQuery);
    
    const columns: TableColumn[] = [];
    const primaryKeys: string[] = [];
    
    if (typeof describeOutput === "string" && describeOutput.trim() !== "") {
      const lines = describeOutput.trim().split("\n");
      if (lines.length > 1) {
        const headers = lines[0].split("\t");
        const fieldIndex = headers.indexOf("Field");
        const typeIndex = headers.indexOf("Type");
        const keyIndex = headers.indexOf("Key");
        const nullIndex = headers.indexOf("Null");
        const defaultIndex = headers.indexOf("Default");
        const extraIndex = headers.indexOf("Extra");

        lines.slice(1).forEach(line => {
          const values = line.split("\t");
          const isPrimaryKey = keyIndex !== -1 && values[keyIndex] === "PRI";
          
          if (isPrimaryKey) {
            primaryKeys.push(values[fieldIndex]);
          }
          
          columns.push({
            name: values[fieldIndex],
            type: values[typeIndex],
            isPrimaryKey,
            isNullable: nullIndex !== -1 && values[nullIndex] === "YES",
            defaultValue: defaultIndex !== -1 ? (values[defaultIndex] || undefined) : undefined,
            extra: extraIndex !== -1 ? (values[extraIndex] || undefined) : undefined,
          });
        });
      }
    }
    
    // Get foreign key constraints
    const foreignKeys: ForeignKey[] = [];
    try {
      const fkQuery = `
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME,
          CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = '${tableName}' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `;
      const fkOutput = await wpCli.db.query(fkQuery);
      
      if (typeof fkOutput === "string" && fkOutput.trim() !== "") {
        const fkLines = fkOutput.trim().split("\n");
        if (fkLines.length > 1) {
          fkLines.slice(1).forEach(line => {
            const values = line.split("\t");
            if (values.length >= 4) {
              foreignKeys.push({
                columnName: values[0],
                referencedTable: values[1],
                referencedColumn: values[2],
                constraintName: values[3],
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn(`Could not fetch foreign keys for table ${tableName}:`, error);
    }
    
    // Get indexes
    const indexes: TableIndex[] = [];
    try {
      const indexQuery = `SHOW INDEX FROM \`${tableName}\``;
      const indexOutput = await wpCli.db.query(indexQuery);
      
      if (typeof indexOutput === "string" && indexOutput.trim() !== "") {
        const indexLines = indexOutput.trim().split("\n");
        if (indexLines.length > 1) {
          indexLines.slice(1).forEach(line => {
            const values = line.split("\t");
            if (values.length >= 13) {
              indexes.push({
                indexName: values[2],
                columnName: values[4],
                isUnique: values[1] === "0",
                indexType: values[10] || "BTREE",
              });
            }
          });
        }
      }
    } catch (error) {
      console.warn(`Could not fetch indexes for table ${tableName}:`, error);
    }
    
    return {
      tableName,
      columns,
      primaryKeys,
      foreignKeys,
      indexes,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in getTableSchemaAction for table ${tableName}:`, error);
    throw new Error(`Falha ao buscar esquema da tabela ${tableName}: ${message}`);
  }
}

// Add new column to table
export async function addColumnAction(
  instanceId: number,
  tableName: string,
  columnName: string,
  columnType: string,
  isNullable = true,
  defaultValue?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    
    let sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnType}`;
    
    if (!isNullable) {
      sql += " NOT NULL";
    }
    
    if (defaultValue !== undefined) {
      sql += ` DEFAULT ${escapeSqlValue(defaultValue)}`;
    }
    
    const result = await wpCli.db.query(sql);
    
    if (typeof result === "string" && (result.trim() === "" || /Query OK/.test(result))) {
      return { success: true, message: "Coluna adicionada com sucesso." };
    }
    
    return { success: false, message: `Falha ao adicionar coluna: ${result}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in addColumnAction:", error);
    return { success: false, message: `Erro ao adicionar coluna: ${message}` };
  }
}

// Drop column from table
export async function dropColumnAction(
  instanceId: number,
  tableName: string,
  columnName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const sql = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``;
    const result = await wpCli.db.query(sql);
    
    if (typeof result === "string" && (result.trim() === "" || /Query OK/.test(result))) {
      return { success: true, message: "Coluna removida com sucesso." };
    }
    
    return { success: false, message: `Falha ao remover coluna: ${result}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in dropColumnAction:", error);
    return { success: false, message: `Erro ao remover coluna: ${message}` };
  }
}

// Drop entire table
export async function dropTableAction(
  instanceId: number,
  tableName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const sql = `DROP TABLE \`${tableName}\``;
    const result = await wpCli.db.query(sql);
    
    if (typeof result === "string" && (result.trim() === "" || /Query OK/.test(result))) {
      return { success: true, message: "Tabela removida com sucesso." };
    }
    
    return { success: false, message: `Falha ao remover tabela: ${result}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in dropTableAction:", error);
    return { success: false, message: `Erro ao remover tabela: ${message}` };
  }
}

// Get database information
export async function getDatabaseInfoAction(
  instanceId: number
): Promise<DatabaseInfo> {
  try {
    const wpCli = new WpCliApi(instanceId);
    
    // Get database name
    const dbNameQuery = "SELECT DATABASE() as db_name";
    const dbNameResult = await wpCli.db.query(dbNameQuery);
    
    let dbName = "Unknown";
    if (typeof dbNameResult === "string" && dbNameResult.trim() !== "") {
      const lines = dbNameResult.trim().split("\n");
      if (lines.length > 1) {
        dbName = lines[1].split("\t")[0] || "Unknown";
      }
    }
    
    // Get tables
    const tables = await getDbTablesAction(instanceId);
    
    // Get database size (approximate)
    const sizeQuery = `
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB'
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;
    
    let size = "Unknown";
    try {
      const sizeResult = await wpCli.db.query(sizeQuery);
      if (typeof sizeResult === "string" && sizeResult.trim() !== "") {
        const sizeLines = sizeResult.trim().split("\n");
        if (sizeLines.length > 1) {
          size = `${sizeLines[1].split("\t")[0]} MB`;
        }
      }
    } catch (error) {
      console.warn("Could not fetch database size:", error);
    }
    
    // Get charset and collation
    const charsetQuery = `
      SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = DATABASE()
    `;
    
    let charset = "Unknown";
    let collation = "Unknown";
    try {
      const charsetResult = await wpCli.db.query(charsetQuery);
      if (typeof charsetResult === "string" && charsetResult.trim() !== "") {
        const charsetLines = charsetResult.trim().split("\n");
        if (charsetLines.length > 1) {
          const values = charsetLines[1].split("\t");
          charset = values[0] || "Unknown";
          collation = values[1] || "Unknown";
        }
      }
    } catch (error) {
      console.warn("Could not fetch charset and collation:", error);
    }
    
    return {
      name: dbName,
      tables,
      size,
      charset,
      collation,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in getDatabaseInfoAction:", error);
    throw new Error(`Falha ao buscar informações do banco de dados: ${message}`);
  }
}

// Bulk operations
export async function bulkDeleteRowsAction(
  instanceId: number,
  tableName: string,
  primaryKeyColumns: TableColumn[],
  rowsToDelete: TableRowData[]
): Promise<{ success: boolean; message: string; deletedCount: number }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    let deletedCount = 0;
    
    for (const row of rowsToDelete) {
      const pkColsInRowData = primaryKeyColumns.filter(col => 
        col.isPrimaryKey && Object.prototype.hasOwnProperty.call(row, col.name)
      );
      
      let whereClauses = "";
      if (pkColsInRowData.length > 0) {
        whereClauses = pkColsInRowData
          .map(col => `\`${col.name}\` = ${escapeSqlValue(row[col.name])}`)
          .join(" AND ");
      } else {
        whereClauses = Object.keys(row)
          .map((key) => `\`${key}\` = ${escapeSqlValue(row[key])}`)
          .join(" AND ");
      }
      
      if (whereClauses) {
        const sql = `DELETE FROM \`${tableName}\` WHERE ${whereClauses} LIMIT 1`;
        const result = await wpCli.db.query(sql);
        
        if (typeof result === "string" && 
            (result.trim() === "" || /Query OK/.test(result) || /Rows affected/.test(result))) {
          deletedCount++;
        }
      }
    }
    
    return { 
      success: true, 
      message: `${deletedCount} linha(s) removida(s) com sucesso.`,
      deletedCount 
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in bulkDeleteRowsAction:", error);
    return { 
      success: false, 
      message: `Erro ao remover linhas: ${message}`,
      deletedCount: 0 
    };
  }
}

// Export table data as CSV
export async function exportTableDataAction(
  instanceId: number,
  tableName: string,
  format: "csv" | "json" = "csv"
): Promise<{ success: boolean; data?: string; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    const result = await getDbTableDataAction(instanceId, tableName);
    
    if (format === "csv") {
      // Generate CSV
      const headers = result.columns.map(col => col.name).join(",");
      const rows = result.rows.map(row => 
        result.columns.map(col => {
          const value = row[col.name];
          // Escape CSV values
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(",")
      ).join("\n");
      
      const csvData = `${headers}\n${rows}`;
      return { 
        success: true, 
        data: csvData, 
        message: "Dados exportados como CSV com sucesso." 
      };
    } else {
      // Generate JSON
      const jsonData = JSON.stringify({
        table: tableName,
        columns: result.columns,
        rows: result.rows,
        exportDate: new Date().toISOString()
      }, null, 2);
      
      return { 
        success: true, 
        data: jsonData, 
        message: "Dados exportados como JSON com sucesso." 
      };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in exportTableDataAction:", error);
    return { 
      success: false, 
      message: `Erro ao exportar dados: ${message}` 
    };
  }
}

// Create new table with basic structure
export async function createTableAction(
  instanceId: number,
  tableName: string,
  columns: Array<{
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isNullable?: boolean;
    defaultValue?: string;
  }>
): Promise<{ success: boolean; message: string }> {
  try {
    const wpCli = new WpCliApi(instanceId);
    
    const columnDefinitions = columns.map(col => {
      let definition = `\`${col.name}\` ${col.type}`;
      
      if (!col.isNullable) {
        definition += " NOT NULL";
      }
      
      if (col.defaultValue !== undefined) {
        definition += ` DEFAULT ${escapeSqlValue(col.defaultValue)}`;
      }
      
      if (col.isPrimaryKey) {
        definition += " PRIMARY KEY";
      }
      
      return definition;
    }).join(", ");
    
    const sql = `CREATE TABLE \`${tableName}\` (${columnDefinitions})`;
    const result = await wpCli.db.query(sql);
    
    if (typeof result === "string" && (result.trim() === "" || /Query OK/.test(result))) {
      return { success: true, message: "Tabela criada com sucesso." };
    }
    
    return { success: false, message: `Falha ao criar tabela: ${result}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in createTableAction:", error);
    return { success: false, message: `Erro ao criar tabela: ${message}` };
  }
}

// Get database size and statistics
export async function getDatabaseStatsAction(
  instanceId: number
): Promise<{
  success: boolean;
  data?: {
    totalTables: number;
    totalRows: number;
    databaseSize: string;
    largestTable: string;
    tableStats: Array<{
      tableName: string;
      rowCount: number;
      sizeInMB: number;
    }>;
  };
  message: string;
}> {
  try {
    const wpCli = new WpCliApi(instanceId);
    
    // Get table list
    const tables = await getDbTablesAction(instanceId);
    
    // Get detailed stats for each table
    const tableStats = [];
    let totalRows = 0;
    
    for (const table of tables) {
      try {
        // Get row count
        const countQuery = `SELECT COUNT(*) as row_count FROM \`${table}\``;
        const countResult = await wpCli.db.query(countQuery);
        
        let rowCount = 0;
        if (typeof countResult === "string" && countResult.trim() !== "") {
          const lines = countResult.trim().split("\n");
          if (lines.length > 1) {
            rowCount = Number.parseInt(lines[1]) || 0;
          }
        }
        
        // Get table size
        const sizeQuery = `
          SELECT 
            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
          FROM information_schema.TABLES 
          WHERE table_schema = DATABASE() AND table_name = '${table}'
        `;
        
        let sizeInMB = 0;
        try {
          const sizeResult = await wpCli.db.query(sizeQuery);
          if (typeof sizeResult === "string" && sizeResult.trim() !== "") {
            const sizeLines = sizeResult.trim().split("\n");
            if (sizeLines.length > 1) {
              sizeInMB = Number.parseFloat(sizeLines[1]) || 0;
            }
          }
        } catch (error) {
          console.warn(`Could not get size for table ${table}:`, error);
        }
        
        tableStats.push({
          tableName: table,
          rowCount,
          sizeInMB,
        });
        
        totalRows += rowCount;
      } catch (error) {
        console.warn(`Could not get stats for table ${table}:`, error);
      }
    }
    
    // Find largest table
    const largestTable = tableStats.reduce((largest, current) => 
      current.sizeInMB > largest.sizeInMB ? current : largest, 
      tableStats[0] || { tableName: "N/A", sizeInMB: 0 }
    );
    
    // Get total database size
    const totalSizeQuery = `
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'total_size_mb'
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;
    
    let databaseSize = "0 MB";
    try {
      const totalSizeResult = await wpCli.db.query(totalSizeQuery);
      if (typeof totalSizeResult === "string" && totalSizeResult.trim() !== "") {
        const totalSizeLines = totalSizeResult.trim().split("\n");
        if (totalSizeLines.length > 1) {
          const sizeMB = totalSizeLines[1];
          databaseSize = `${sizeMB} MB`;
        }
      }
    } catch (error) {
      console.warn("Could not get total database size:", error);
    }
    
    return {
      success: true,
      data: {
        totalTables: tables.length,
        totalRows,
        databaseSize,
        largestTable: largestTable.tableName,
        tableStats: tableStats.sort((a, b) => b.sizeInMB - a.sizeInMB),
      },
      message: "Estatísticas do banco de dados carregadas com sucesso.",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in getDatabaseStatsAction:", error);
    return { 
      success: false, 
      message: `Erro ao carregar estatísticas: ${message}` 
    };
  }
}
