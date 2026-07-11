import type { ColumnDef, TableDef } from "../types/index.js";
import type { ColumnType } from "../types/index.js";
import { toCamelCase, toSnakeCase } from "../lib/naming.js";

export abstract class DialectGenerator {
  abstract dialect: string;
  abstract importSource: string;
  abstract tableFunction: string;

  abstract mapColumnType(colName: string, def: ColumnDef): string;
  abstract generateTable(name: string, def: TableDef): string;

  columnTypeToImportName(type: ColumnType): string | null {
    const map = this.columnImportMap();
    return map[type] ?? null;
  }

  protected abstract columnImportMap(): Record<string, string | null>;

  getColumnTypeImports(def: TableDef): string[] {
    const names = new Set<string>();
    for (const col of Object.values(def.columns)) {
      const name = this.columnTypeToImportName(col.type);
      if (name) names.add(name);
    }
    return [...names].sort();
  }

  needsSqlImport(tableDef: TableDef): boolean {
    return false;
  }

  toColumnName(name: string, casing: "snake_case" | "camelCase"): string {
    return casing === "camelCase" ? toCamelCase(name) : toSnakeCase(name);
  }
}
