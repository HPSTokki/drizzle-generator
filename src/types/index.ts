export type ColumnType =
  | "serial"
  | "bigserial"
  | "integer"
  | "bigint"
  | "smallint"
  | "varchar"
  | "char"
  | "text"
  | "boolean"
  | "timestamp"
  | "date"
  | "time"
  | "json"
  | "jsonb"
  | "real"
  | "double"
  | "decimal"
  | "uuid"
  | "pgEnum"
  | "mysqlEnum"
  | "blob"
  | "numeric"
  | "int";

export interface ColumnDef {
  type: ColumnType;
  length?: number;
  primaryKey?: boolean;
  unique?: boolean;
  default?: string | number | boolean;
  nullable?: boolean;
  enum?: string;
  references?: { table: string; column: string };
  comment?: string;
}

export interface TableDef {
  schema?: string;
  columns: Record<string, ColumnDef>;
}
