import { DialectGenerator } from "./base.js";
import type { ColumnDef, TableDef } from "../types/index.js";

export class MysqlGenerator extends DialectGenerator {
  dialect = "mysql";
  importSource = "drizzle-orm/mysql-core";
  tableFunction = "mysqlTable";

  mapColumnType(colName: string, def: ColumnDef): string {
    const name = this.toColumnName(colName, "snake_case");
    let col: string;

    switch (def.type) {
      case "serial":
        col = `serial('${name}')`;
        break;
      case "bigserial":
        col = `bigserial('${name}', { startWith: 1 })`;
        break;
      case "integer":
      case "int":
        col = `int('${name}')`;
        break;
      case "bigint":
        col = `bigint('${name}', { mode: 'number' })`;
        break;
      case "smallint":
        col = `smallint('${name}')`;
        break;
      case "varchar":
        col = def.length
          ? `varchar('${name}', { length: ${def.length} })`
          : `varchar('${name}')`;
        break;
      case "char":
        col = def.length
          ? `char('${name}', { length: ${def.length} })`
          : `char('${name}')`;
        break;
      case "text":
        col = `text('${name}')`;
        break;
      case "boolean":
        col = `boolean('${name}')`;
        break;
      case "timestamp":
        col = `timestamp('${name}', { mode: 'date' })`;
        break;
      case "date":
        col = `date('${name}')`;
        break;
      case "time":
        col = `time('${name}')`;
        break;
      case "json":
        col = `json('${name}')`;
        break;
      case "real":
        col = `real('${name}')`;
        break;
      case "double":
        col = `double('${name}')`;
        break;
      case "decimal":
      case "numeric":
        col = `decimal('${name}', { precision: 10, scale: 2 })`;
        break;
      case "mysqlEnum":
        col = `${colName}Enum('${name}')`;
        break;
      case "blob":
        col = `blob('${name}')`;
        break;
      default:
        col = `text('${name}')`;
    }

    if (def.primaryKey) col += ".primaryKey()";
    if (def.unique) col += ".unique()";
    if (def.nullable === false) col += ".notNull()";
    if (def.default !== undefined) {
      const dv =
        typeof def.default === "string"
          ? `'${def.default}'`
          : String(def.default);
      if (def.default === "now") {
        col += ".defaultNow()";
      } else {
        col += `.default(${dv})`;
      }
    }
    if (def.references) {
      col += `.references(() => ${def.references.table}.${def.references.column})`;
    }

    return col;
  }

  generateTable(name: string, def: TableDef): string {
    const lines: string[] = [];
    lines.push(`export const ${name} = mysqlTable('${name}', {`);
    for (const [colName, colDef] of Object.entries(def.columns)) {
      const mapped = this.mapColumnType(colName, colDef);
      lines.push(`  ${this.toColumnName(colName, "camelCase")}: ${mapped},`);
    }
    lines.push("})");
    return lines.join("\n");
  }

  protected columnImportMap(): Record<string, string | null> {
    return {
      serial: "serial",
      bigserial: "bigserial",
      integer: "int",
      int: "int",
      bigint: "bigint",
      smallint: "smallint",
      varchar: "varchar",
      char: "char",
      text: "text",
      boolean: "boolean",
      timestamp: "timestamp",
      date: "date",
      time: "time",
      json: "json",
      jsonb: "json",
      real: "real",
      double: "double",
      decimal: "decimal",
      numeric: "decimal",
      uuid: "text",
      pgEnum: null,
      mysqlEnum: null,
      blob: "blob",
    };
  }
}
