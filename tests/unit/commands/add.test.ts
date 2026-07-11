import { describe, it, expect } from "vitest";
import { buildAutoTable } from "../../../src/commands/add.js";
import { PgGenerator } from "../../../src/generators/pg.js";
import { MysqlGenerator } from "../../../src/generators/mysql.js";
import { SqliteGenerator } from "../../../src/generators/sqlite.js";
import { ZodValidatorGenerator } from "../../../src/generators/validators/zod.js";
import { TypeboxValidatorGenerator } from "../../../src/generators/validators/typebox.js";

describe("buildAutoTable", () => {
  it("returns a table def with id, createdAt, updatedAt", () => {
    const def = buildAutoTable("users");
    expect(def.columns.id).toEqual({ type: "serial", primaryKey: true });
    expect(def.columns.createdAt).toEqual({ type: "timestamp", default: "now", nullable: false });
    expect(def.columns.updatedAt).toEqual({ type: "timestamp", default: "now", nullable: false });
  });
});

describe("add command output", () => {
  it("generates correct pg output with imports", () => {
    const gen = new PgGenerator();
    const def = buildAutoTable("users");
    const typeImports = gen.getColumnTypeImports(def);
    const importNames = [gen.tableFunction, ...typeImports].join(", ");
    const code = `import { ${importNames} } from '${gen.importSource}'\n\n${gen.generateTable("users", def)}\n`;
    expect(code).toContain("import { pgTable, serial, timestamp } from 'drizzle-orm/pg-core'");
    expect(code).toContain("export const users = pgTable('users', {");
    expect(code).toContain("id: serial('id').primaryKey(),");
    expect(code).toContain("createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),");
    expect(code).toContain("updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),");
  });

  it("generates correct mysql output with imports", () => {
    const gen = new MysqlGenerator();
    const def = buildAutoTable("posts");
    const typeImports = gen.getColumnTypeImports(def);
    const importNames = [gen.tableFunction, ...typeImports].join(", ");
    const code = `import { ${importNames} } from '${gen.importSource}'\n\n${gen.generateTable("posts", def)}\n`;
    expect(code).toContain("import { mysqlTable, serial, timestamp } from 'drizzle-orm/mysql-core'");
    expect(code).toContain("export const posts = mysqlTable('posts', {");
    expect(code).toContain("id: serial('id').primaryKey(),");
    expect(code).toContain("createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),");
    expect(code).toContain("updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),");
  });

  it("generates correct sqlite output with imports", () => {
    const gen = new SqliteGenerator();
    const def = buildAutoTable("items");
    const typeImports = gen.getColumnTypeImports(def);
    const importNames = [gen.tableFunction, ...typeImports].join(", ");
    const imports: string[] = [`import { ${importNames} } from '${gen.importSource}'`];
    if (gen.needsSqlImport(def)) {
      imports.push("import { sql } from 'drizzle-orm'");
    }
    const code = [...imports, "", gen.generateTable("items", def), ""].join("\n");
    expect(code).toContain("import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'");
    expect(code).toContain("import { sql } from 'drizzle-orm'");
    expect(code).toContain("export const items = sqliteTable('items', {");
    expect(code).toContain("id: integer('id').primaryKey({ autoIncrement: true }),");
    expect(code).toContain("createdAt: text('created_at').notNull().default(sql`(current_timestamp)`),");
    expect(code).toContain("updatedAt: text('updated_at').notNull().default(sql`(current_timestamp)`),");
  });

  it("generates zod validator output with add-style prefix", () => {
    const gen = new ZodValidatorGenerator();
    gen.schemaImportPrefix = "../";
    const def = buildAutoTable("users");
    const code = gen.generate("users", def);
    expect(code).toContain("import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod'");
    expect(code).toContain("import { users } from '../users'");
    expect(code).toContain("export const insertUsersSchema = createInsertSchema(users)");
    expect(code).toContain("export const selectUsersSchema = createSelectSchema(users)");
    expect(code).toContain("export const updateUsersSchema = createUpdateSchema(users)");
  });

  it("generates typebox validator output with add-style prefix", () => {
    const gen = new TypeboxValidatorGenerator();
    gen.schemaImportPrefix = "../";
    const def = buildAutoTable("users");
    const code = gen.generate("users", def);
    expect(code).toContain("import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/typebox'");
    expect(code).toContain("import { Type } from 'typebox'");
    expect(code).toContain("import { users } from '../users'");
    expect(code).toContain("export const insertUsersSchema = createInsertSchema(users)");
  });

  it("zod barrel entry is correct", () => {
    const gen = new ZodValidatorGenerator();
    const barrel = gen.barrelEntry(["users", "posts"]);
    expect(barrel).toContain("insertUsersSchema, selectUsersSchema, updateUsersSchema } from './users'");
    expect(barrel).toContain("insertPostsSchema, selectPostsSchema, updatePostsSchema } from './posts'");
  });

  it("typebox barrel entry is correct", () => {
    const gen = new TypeboxValidatorGenerator();
    const barrel = gen.barrelEntry(["users"]);
    expect(barrel).toContain("insertUsersSchema, selectUsersSchema, updateUsersSchema } from './users'");
  });
});
