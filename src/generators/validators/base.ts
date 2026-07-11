import type { TableDef } from "../../types/index.js";

export abstract class ValidatorGenerator {
  abstract name: string;

  schemaImportPrefix = "../schema/";

  abstract generate(tableName: string, _def: TableDef): string;
  abstract barrelEntry(tableNames: string[]): string;
}
