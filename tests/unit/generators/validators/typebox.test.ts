import { describe, it, expect } from "vitest";
import { TypeboxValidatorGenerator } from "../../../../src/generators/validators/typebox.js";

describe("TypeboxValidatorGenerator", () => {
  it("has the correct name", () => {
    const gen = new TypeboxValidatorGenerator();
    expect(gen.name).toBe("typebox");
  });

  it("generates correct imports and schema exports with default prefix", () => {
    const gen = new TypeboxValidatorGenerator();
    const code = gen.generate("users", { columns: { id: { type: "serial" } } });
    expect(code).toContain(
      "import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/typebox'",
    );
    expect(code).toContain("import { Type } from 'typebox'");
    expect(code).toContain("import { users } from '../schema/users'");
    expect(code).toContain("export const insertUsersSchema = createInsertSchema(users)");
    expect(code).toContain("export const selectUsersSchema = createSelectSchema(users)");
    expect(code).toContain("export const updateUsersSchema = createUpdateSchema(users)");
  });

  it("uses custom schemaImportPrefix when set", () => {
    const gen = new TypeboxValidatorGenerator();
    gen.schemaImportPrefix = "../";
    const code = gen.generate("users", { columns: { id: { type: "serial" } } });
    expect(code).toContain("import { users } from '../users'");
  });

  it("barrelEntry re-exports all schemas", () => {
    const gen = new TypeboxValidatorGenerator();
    const barrel = gen.barrelEntry(["users", "posts"]);
    expect(barrel).toContain("insertUsersSchema, selectUsersSchema, updateUsersSchema");
    expect(barrel).toContain("insertPostsSchema, selectPostsSchema, updatePostsSchema");
  });

  it("barrelEntry handles single table", () => {
    const gen = new TypeboxValidatorGenerator();
    const barrel = gen.barrelEntry(["users"]);
    expect(barrel).toContain("insertUsersSchema");
    expect(barrel).not.toContain("Posts");
  });
});
