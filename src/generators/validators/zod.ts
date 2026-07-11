import { ValidatorGenerator } from "./base.js";
import type { TableDef } from "../../types/index.js";

export class ZodValidatorGenerator extends ValidatorGenerator {
  name = "zod";

  generate(tableName: string, _def: TableDef): string {
    return [
      `import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod'`,
      `import { ${tableName} } from '${this.schemaImportPrefix}${tableName}'`,
      "",
      `export const insert${capitalize(tableName)}Schema = createInsertSchema(${tableName})`,
      `export const select${capitalize(tableName)}Schema = createSelectSchema(${tableName})`,
      `export const update${capitalize(tableName)}Schema = createUpdateSchema(${tableName})`,
    ].join("\n");
  }

  barrelEntry(tableNames: string[]): string {
    return tableNames
      .map(
        (t) =>
          `export { insert${capitalize(t)}Schema, select${capitalize(t)}Schema, update${capitalize(t)}Schema } from './${t}'`,
      )
      .join("\n");
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
