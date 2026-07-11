import { Command } from "commander";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { dialectRegistry } from "../generators/registry.js";
import { ZodValidatorGenerator } from "../generators/validators/zod.js";
import { TypeboxValidatorGenerator } from "../generators/validators/typebox.js";
import { tryLoadDrizzleConfig } from "../lib/drizzle-loader.js";
import { select } from "../lib/prompt.js";
import { success, error, info } from "../lib/output.js";
import type { TableDef } from "../types/index.js";

const DIALECT_ALIASES: Record<string, string> = {
  pg: "postgresql",
  postgresql: "postgresql",
  postgres: "postgresql",
  mysql: "mysql",
  sqlite: "sqlite",
};

function mapDialectAlias(raw: string): string | undefined {
  return DIALECT_ALIASES[raw.toLowerCase()];
}

export function buildAutoTable(tableName: string): TableDef {
  return {
    columns: {
      id: { type: "serial", primaryKey: true },
      createdAt: { type: "timestamp", default: "now", nullable: false },
      updatedAt: { type: "timestamp", default: "now", nullable: false },
    },
  };
}

function readOrCreateBarrel(outDir: string): string[] {
  const barrelPath = join(outDir, "index.ts");
  if (existsSync(barrelPath)) {
    return readFileSync(barrelPath, "utf-8")
      .split("\n")
      .filter((l) => l.trim());
  }
  return [];
}

function appendToBarrel(outDir: string, tableName: string): void {
  const barrelPath = join(outDir, "index.ts");
  const lines = readOrCreateBarrel(outDir);
  const entry = `export { ${tableName} } from './${tableName}'`;
  if (!lines.includes(entry)) {
    lines.push(entry);
    lines.sort();
    writeFileSync(barrelPath, lines.join("\n") + "\n", "utf-8");
  }
}

function appendToValidatorBarrel(outDir: string, tableName: string, vg: { barrelEntry: (names: string[]) => string }): void {
  const barrelPath = join(outDir, "index.ts");
  const existing: string[] = [];
  if (existsSync(barrelPath)) {
    const content = readFileSync(barrelPath, "utf-8").trim();
    if (content) existing.push(content);
  }
  existing.push(vg.barrelEntry([tableName]));
  writeFileSync(barrelPath, existing.join("\n") + "\n", "utf-8");
}

export const addCommand = new Command("add")
  .description("Generate a table schema directly")
  .argument("<table>", "Table name")
  .option("-d, --dialect <dialect>", "Dialect: pg, mysql, sqlite (inferred from drizzle.config.ts if omitted)")
  .option("-v, --validator [type]", "Validator: zod or typebox")
  .option("-o, --out <path>", "Output directory (inferred from drizzle.config.ts if omitted)", "./drizzle")
  .addHelpText(
    "after",
    `
Examples:
  drizzle-gen add users -d pg
  drizzle-gen add posts -d mysql -v zod
  drizzle-gen add items -d sqlite -v
  drizzle-gen add products                        (infers dialect from drizzle.config.ts)
  drizzle-gen add products -d pg -o ./src/db/schema
`,
  )
  .action(async (table: string, options: { dialect?: string; validator?: string | boolean; out: string }) => {
    let dialect = options.dialect ? mapDialectAlias(options.dialect) : undefined;

    const drizzleCfg = await tryLoadDrizzleConfig(process.cwd());

    if (drizzleCfg) {
      if (!dialect) {
        const rawDialect = drizzleCfg.dialect ?? drizzleCfg.driver;
        if (rawDialect) {
          dialect = mapDialectAlias(rawDialect);
          if (dialect) {
            info(`Inferred dialect '${dialect}' from drizzle.config.ts`);
          }
        }
      }
      if (options.out === "./drizzle") {
        if (drizzleCfg.schema) {
          const schemaPath = Array.isArray(drizzleCfg.schema) ? drizzleCfg.schema[0] : drizzleCfg.schema;
          const inferred = join(process.cwd(), schemaPath.replace(/\/\*\*$/, "").replace(/\/\*$/, ""));
          if (existsSync(inferred)) {
            options.out = inferred;
          } else if (drizzleCfg.out) {
            options.out = drizzleCfg.out;
          }
        } else if (drizzleCfg.out) {
          options.out = drizzleCfg.out;
        }
      }
    }

    if (!dialect) {
      error("No dialect specified. Use -d pg|mysql|sqlite, or add a drizzle.config.ts");
      process.exit(1);
    }

    const Generator = dialectRegistry[dialect];
    if (!Generator) {
      error(`No generator for dialect: ${dialect}`);
      process.exit(1);
    }

    const generator = Generator;
    const outDir = join(process.cwd(), options.out);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    let validators: { name: string; generate: (name: string, def: TableDef) => string; barrelEntry: (names: string[]) => string }[] = [];

    if (options.validator !== undefined) {
      let validatorType: string;
      if (typeof options.validator === "string") {
        validatorType = options.validator;
      } else {
        validatorType = await select("Select validator", ["zod", "typebox"]);
      }

      switch (validatorType) {
        case "zod": {
          const v = new ZodValidatorGenerator();
          v.schemaImportPrefix = "../";
          validators.push(v);
          break;
        }
        case "typebox": {
          const v = new TypeboxValidatorGenerator();
          v.schemaImportPrefix = "../";
          validators.push(v);
          break;
        }
        default:
          error(`Unknown validator: ${validatorType}. Use zod or typebox`);
          process.exit(1);
      }
    }

    const tableDef = buildAutoTable(table);
    const typeImports = generator.getColumnTypeImports(tableDef);
    const importNames = [generator.tableFunction, ...typeImports].join(", ");
    const imports: string[] = [
      `import { ${importNames} } from '${generator.importSource}'`,
    ];
    if (generator.needsSqlImport(tableDef)) {
      imports.push(`import { sql } from 'drizzle-orm'`);
    }
    const code = [...imports, "", generator.generateTable(table, tableDef), ""].join("\n");

    writeFileSync(join(outDir, `${table}.ts`), code, "utf-8");
    appendToBarrel(outDir, table);
    success(`Generated ${join(options.out, `${table}.ts`)}`);

    if (validators.length > 0) {
      const validatorsDir = join(outDir, "validations");
      if (!existsSync(validatorsDir)) mkdirSync(validatorsDir, { recursive: true });

      for (const vg of validators) {
        const vCode = vg.generate(table, tableDef);
        writeFileSync(join(validatorsDir, `${table}.ts`), vCode + "\n", "utf-8");
        appendToValidatorBarrel(validatorsDir, table, vg);
        success(`Generated ${join(options.out, "validations", `${table}.ts`)} (${vg.name})`);
      }
    }

    console.log(`\n  Table: ${table}`);
    console.log(`  Dialect: ${dialect}`);
    console.log(`  Fields: id, createdAt, updatedAt`);
  });
