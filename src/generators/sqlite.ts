import { DialectGenerator } from "./base.js";
import type { ColumnDef, TableDef } from "../types/index.js";

export class SqliteGenerator extends DialectGenerator {
  dialect = "sqlite";
  importSource = "drizzle-orm/sqlite-core";
  tableFunction = "sqliteTable";

  mapColumnType(colName: string, def: ColumnDef): string {
    const name = this.toColumnName(colName, "snake_case");
    let col: string;

    switch (def.type) {
      case "serial":
      case "integer":
      case "int":
        col = `integer('${name}')`;
        break;
      case "bigint":
      case "bigserial":
        col = `integer('${name}')`;
        break;
      case "smallint":
        col = `integer('${name}')`;
        break;
      case "varchar":
      case "char":
      case "text":
        col = `text('${name}')`;
        break;
      case "boolean":
        col = `integer('${name}', { mode: 'boolean' })`;
        break;
      case "timestamp":
      case "date":
      case "time":
        col = `text('${name}')`;
        break;
      case "json":
      case "jsonb":
        col = `text('${name}', { mode: 'json' })`;
        break;
      case "real":
      case "double":
        col = `real('${name}')`;
        break;
      case "decimal":
      case "numeric":
        col = `real('${name}')`;
        break;
      case "uuid":
        col = `text('${name}')`;
        break;
      case "blob":
        col = `blob('${name}')`;
        break;
      default:
        col = `text('${name}')`;
    }

    if (def.primaryKey) {
      if (def.type === "serial" || def.type === "integer") {
        col += ".primaryKey({ autoIncrement: true })";
      } else {
        col += ".primaryKey()";
      }
    }
    if (def.unique) col += ".unique()";
    if (def.nullable === false) col += ".notNull()";
    if (def.default !== undefined) {
      const dv =
        typeof def.default === "string"
          ? `'${def.default}'`
          : String(def.default);
      if (def.default === "now") {
        col += ".default(sql`(current_timestamp)`)";
      } else {
        col += `.default(${dv})`;
      }
    }

    return col;
  }

  needsSqlImport(def: TableDef): boolean {
    return Object.values(def.columns).some(c => c.default === "now");
  }

  generateTable(name: string, def: TableDef): string {
    const lines: string[] = [];
    lines.push(`export const ${name} = sqliteTable('${name}', {`);
    for (const [colName, colDef] of Object.entries(def.columns)) {
      const mapped = this.mapColumnType(colName, colDef);
      lines.push(`  ${this.toColumnName(colName, "camelCase")}: ${mapped},`);
    }
    lines.push("})");
    return lines.join("\n");
  }

  protected columnImportMap(): Record<string, string | null> {
    return {
      serial: "integer",
      bigserial: "integer",
      integer: "integer",
      int: "integer",
      bigint: "integer",
      smallint: "integer",
      varchar: "text",
      char: "text",
      text: "text",
      boolean: "integer",
      timestamp: "text",
      date: "text",
      time: "text",
      json: "text",
      jsonb: "text",
      real: "real",
      double: "real",
      decimal: "real",
      numeric: "real",
      uuid: "text",
      pgEnum: null,
      mysqlEnum: null,
      blob: "blob",
    };
  }
}
