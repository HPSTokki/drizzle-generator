import { describe, it, expect } from "vitest";
import { MysqlGenerator } from "../../../src/generators/mysql.js";
import type { TableDef } from "../../../src/types/index.js";

const gen = new MysqlGenerator();

describe("MysqlGenerator.mapColumnType", () => {
  it("maps serial column", () => {
    const result = gen.mapColumnType("id", { type: "serial", primaryKey: true });
    expect(result).toBe("serial('id').primaryKey()");
  });

  it("maps int column", () => {
    const result = gen.mapColumnType("age", { type: "int" });
    expect(result).toBe("int('age')");
  });

  it("maps integer as int", () => {
    const result = gen.mapColumnType("count", { type: "integer" });
    expect(result).toBe("int('count')");
  });

  it("maps varchar with length", () => {
    const result = gen.mapColumnType("name", { type: "varchar", length: 255, nullable: false });
    expect(result).toBe("varchar('name', { length: 255 }).notNull()");
  });

  it("maps boolean column", () => {
    const result = gen.mapColumnType("active", { type: "boolean", default: true });
    expect(result).toBe("boolean('active').default(true)");
  });

  it("maps timestamp with date mode", () => {
    const result = gen.mapColumnType("createdAt", { type: "timestamp", default: "now" });
    expect(result).toContain("timestamp('created_at'");
    expect(result).toContain(".defaultNow()");
  });

  it("maps decimal with precision", () => {
    const result = gen.mapColumnType("price", { type: "decimal" });
    expect(result).toBe("decimal('price', { precision: 10, scale: 2 })");
  });

  it("maps json column", () => {
    const result = gen.mapColumnType("data", { type: "json" });
    expect(result).toBe("json('data')");
  });

  it("maps tinyint for smallint", () => {
    const result = gen.mapColumnType("qty", { type: "smallint", nullable: false });
    expect(result).toBe("smallint('qty').notNull()");
  });

  it("maps mysqlEnum", () => {
    const result = gen.mapColumnType("size", { type: "mysqlEnum", enum: "small,medium,large" });
    expect(result).toBe("sizeEnum('size')");
  });

  it("maps blob", () => {
    const result = gen.mapColumnType("file", { type: "blob" });
    expect(result).toBe("blob('file')");
  });

  it("maps text", () => {
    const result = gen.mapColumnType("body", { type: "text" });
    expect(result).toBe("text('body')");
  });

  it("maps unique + notNull combined", () => {
    const result = gen.mapColumnType("slug", { type: "varchar", length: 100, unique: true, nullable: false });
    expect(result).toBe("varchar('slug', { length: 100 }).unique().notNull()");
  });
});

describe("MysqlGenerator.generateTable", () => {
  it("generates a complete mysqlTable", () => {
    const def: TableDef = {
      columns: {
        id: { type: "serial", primaryKey: true },
        email: { type: "varchar", length: 255, unique: true },
      },
    };
    const code = gen.generateTable("users", def);
    expect(code).toContain("export const users = mysqlTable('users', {");
    expect(code).toContain("id: serial('id').primaryKey(),");
    expect(code).toContain("email: varchar('email', { length: 255 }).unique(),");
    expect(code).toContain("})");
  });
});
