import { describe, it, expect } from "vitest";
import { SqliteGenerator } from "../../../src/generators/sqlite.js";
import type { TableDef } from "../../../src/types/index.js";

const gen = new SqliteGenerator();

describe("SqliteGenerator.mapColumnType", () => {
  it("maps integer primary key with autoIncrement", () => {
    const result = gen.mapColumnType("id", { type: "integer", primaryKey: true });
    expect(result).toBe("integer('id').primaryKey({ autoIncrement: true })");
  });

  it("maps serial as integer with autoIncrement and primaryKey", () => {
    const result = gen.mapColumnType("id", { type: "serial", primaryKey: true });
    expect(result).toBe("integer('id').primaryKey({ autoIncrement: true })");
  });

  it("maps text column", () => {
    const result = gen.mapColumnType("name", { type: "varchar", nullable: false });
    expect(result).toBe("text('name').notNull()");
  });

  it("maps char as text", () => {
    const result = gen.mapColumnType("code", { type: "char", length: 3 });
    expect(result).toBe("text('code')");
  });

  it("maps boolean as integer mode boolean", () => {
    const result = gen.mapColumnType("active", { type: "boolean" });
    expect(result).toBe("integer('active', { mode: 'boolean' })");
  });

  it("maps json as text mode json", () => {
    const result = gen.mapColumnType("data", { type: "json" });
    expect(result).toBe("text('data', { mode: 'json' })");
  });

  it("maps jsonb as text mode json", () => {
    const result = gen.mapColumnType("meta", { type: "jsonb" });
    expect(result).toBe("text('meta', { mode: 'json' })");
  });

  it("maps real for double", () => {
    const result = gen.mapColumnType("score", { type: "double" });
    expect(result).toBe("real('score')");
  });

  it("maps real for real", () => {
    const result = gen.mapColumnType("rating", { type: "real" });
    expect(result).toBe("real('rating')");
  });

  it("maps decimal as real", () => {
    const result = gen.mapColumnType("price", { type: "decimal" });
    expect(result).toBe("real('price')");
  });

  it("maps uuid as text", () => {
    const result = gen.mapColumnType("uuid", { type: "uuid" });
    expect(result).toBe("text('uuid')");
  });

  it("maps blob", () => {
    const result = gen.mapColumnType("file", { type: "blob" });
    expect(result).toBe("blob('file')");
  });

  it("maps unique column", () => {
    const result = gen.mapColumnType("email", { type: "text", unique: true });
    expect(result).toBe("text('email').unique()");
  });

  it("maps timestamp as text", () => {
    const result = gen.mapColumnType("createdAt", { type: "timestamp" });
    expect(result).toBe("text('created_at')");
  });

  it("maps timestamp with default sql", () => {
    const result = gen.mapColumnType("createdAt", { type: "timestamp", default: "now" });
    expect(result).toBe("text('created_at').default(sql`(current_timestamp)`)");
  });
});

describe("SqliteGenerator.generateTable", () => {
  it("generates a complete sqliteTable", () => {
    const def: TableDef = {
      columns: {
        id: { type: "integer", primaryKey: true },
        name: { type: "text", nullable: false },
      },
    };
    const code = gen.generateTable("items", def);
    expect(code).toContain("export const items = sqliteTable('items', {");
    expect(code).toContain("id: integer('id').primaryKey({ autoIncrement: true }),");
    expect(code).toContain("name: text('name').notNull(),");
    expect(code).toContain("})");
  });
});
