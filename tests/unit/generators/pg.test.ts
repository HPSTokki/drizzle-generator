import { describe, it, expect } from "vitest";
import { PgGenerator } from "../../../src/generators/pg.js";
import type { TableDef } from "../../../src/types/index.js";

const gen = new PgGenerator();

describe("PgGenerator.mapColumnType", () => {
  it("maps serial column", () => {
    const result = gen.mapColumnType("id", { type: "serial", primaryKey: true });
    expect(result).toBe("serial('id').primaryKey()");
  });

  it("maps bigserial", () => {
    const result = gen.mapColumnType("id", { type: "bigserial" });
    expect(result).toContain("bigserial('id'");
  });

  it("maps varchar with length", () => {
    const result = gen.mapColumnType("name", { type: "varchar", length: 255, nullable: false });
    expect(result).toBe("varchar('name', { length: 255 }).notNull()");
  });

  it("maps varchar without length", () => {
    const result = gen.mapColumnType("bio", { type: "varchar" });
    expect(result).toBe("varchar('bio')");
  });

  it("maps unique email", () => {
    const result = gen.mapColumnType("email", { type: "varchar", length: 255, unique: true, nullable: false });
    expect(result).toBe("varchar('email', { length: 255 }).unique().notNull()");
  });

  it("maps timestamp with defaultNow", () => {
    const result = gen.mapColumnType("createdAt", { type: "timestamp", default: "now", nullable: false });
    expect(result).toBe("timestamp('created_at', { mode: 'date' }).notNull().defaultNow()");
  });

  it("maps timestamp with date mode", () => {
    const result = gen.mapColumnType("updatedAt", { type: "timestamp" });
    expect(result).toContain("{ mode: 'date' }");
  });

  it("maps date with date mode", () => {
    const result = gen.mapColumnType("birthDate", { type: "date" });
    expect(result).toBe("date('birth_date', { mode: 'date' })");
  });

  it("maps text column", () => {
    const result = gen.mapColumnType("content", { type: "text" });
    expect(result).toBe("text('content')");
  });

  it("maps boolean", () => {
    const result = gen.mapColumnType("active", { type: "boolean", default: true });
    expect(result).toBe("boolean('active').default(true)");
  });

  it("maps integer with references", () => {
    const result = gen.mapColumnType("userId", {
      type: "integer",
      references: { table: "users", column: "id" },
    });
    expect(result).toBe("integer('user_id').references(() => users.id)");
  });

  it("maps int (alias) as integer", () => {
    const result = gen.mapColumnType("age", { type: "int" });
    expect(result).toBe("integer('age')");
  });

  it("maps bigint with number mode", () => {
    const result = gen.mapColumnType("visits", { type: "bigint" });
    expect(result).toContain("{ mode: 'number' }");
  });

  it("maps smallint", () => {
    const result = gen.mapColumnType("quantity", { type: "smallint" });
    expect(result).toBe("smallint('quantity')");
  });

  it("maps pgEnum", () => {
    const result = gen.mapColumnType("role", { type: "pgEnum", enum: "user,admin,mod", nullable: false });
    expect(result).toBe("roleEnum('role').notNull()");
  });

  it("maps jsonb", () => {
    const result = gen.mapColumnType("metadata", { type: "jsonb" });
    expect(result).toBe("jsonb('metadata')");
  });

  it("maps json", () => {
    const result = gen.mapColumnType("data", { type: "json" });
    expect(result).toBe("json('data')");
  });

  it("maps double precision", () => {
    const result = gen.mapColumnType("price", { type: "double" });
    expect(result).toBe("doublePrecision('price')");
  });

  it("maps real", () => {
    const result = gen.mapColumnType("rating", { type: "real" });
    expect(result).toBe("real('rating')");
  });

  it("maps decimal/numeric", () => {
    const result = gen.mapColumnType("balance", { type: "numeric" });
    expect(result).toBe("numeric('balance')");
  });

  it("maps uuid", () => {
    const result = gen.mapColumnType("uuid", { type: "uuid" });
    expect(result).toBe("uuid('uuid')");
  });

  it("maps blob to bytea", () => {
    const result = gen.mapColumnType("data", { type: "blob" });
    expect(result).toBe("bytea('data')");
  });

  it("maps unknown type to text fallback", () => {
    const result = gen.mapColumnType("unknown", { type: "text" });
    expect(result).toBe("text('unknown')");
  });
});

describe("PgGenerator.generateTable", () => {
  it("generates a complete pgTable", () => {
    const def: TableDef = {
      columns: {
        id: { type: "serial", primaryKey: true },
        name: { type: "varchar", length: 255, nullable: false },
      },
    };
    const code = gen.generateTable("users", def);
    expect(code).toContain("export const users = pgTable('users', {");
    expect(code).toContain("id: serial('id').primaryKey(),");
    expect(code).toContain("name: varchar('name', { length: 255 }).notNull(),");
    expect(code).toContain("})");
  });

  it("includes all columns in order", () => {
    const def: TableDef = {
      columns: {
        id: { type: "serial", primaryKey: true },
        email: { type: "varchar", length: 255, unique: true, nullable: false },
        createdAt: { type: "timestamp", default: "now", nullable: false },
      },
    };
    const code = gen.generateTable("users", def);
    const lines = code.split("\n");
    expect(lines[1]).toContain("id:");
    expect(lines[2]).toContain("email:");
    expect(lines[3]).toContain("createdAt:");
  });
});
