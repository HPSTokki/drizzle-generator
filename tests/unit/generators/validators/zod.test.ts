import { describe, it, expect } from "vitest";
import { ZodValidatorGenerator } from "../../../../src/generators/validators/zod.js";

describe("ZodValidatorGenerator", () => {
  it("has the correct name", () => {
    const gen = new ZodValidatorGenerator();
    expect(gen.name).toBe("zod");
  });

  it("generates correct imports and schema exports with default prefix", () => {
    const gen = new ZodValidatorGenerator();
    const code = gen.generate("users", { columns: { id: { type: "serial" } } });
    expect(code).toContain(
      "import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod'",
    );
    expect(code).toContain("import { users } from '../schema/users'");
    expect(code).toContain("export const insertUsersSchema = createInsertSchema(users)");
    expect(code).toContain("export const selectUsersSchema = createSelectSchema(users)");
    expect(code).toContain("export const updateUsersSchema = createUpdateSchema(users)");
  });

  it("uses custom schemaImportPrefix when set", () => {
    const gen = new ZodValidatorGenerator();
    gen.schemaImportPrefix = "../";
    const code = gen.generate("users", { columns: { id: { type: "serial" } } });
    expect(code).toContain("import { users } from '../users'");
  });

  it("handles table name with underscore", () => {
    const gen = new ZodValidatorGenerator();
    const code = gen.generate("user_profiles", { columns: { id: { type: "serial" } } });
    expect(code).toContain("import { user_profiles } from '../schema/user_profiles'");
    expect(code).toContain("export const insertUser_profilesSchema");
  });

  it("barrelEntry re-exports all schemas", () => {
    const gen = new ZodValidatorGenerator();
    const barrel = gen.barrelEntry(["users", "posts"]);
    expect(barrel).toContain("insertUsersSchema, selectUsersSchema, updateUsersSchema");
    expect(barrel).toContain("insertPostsSchema, selectPostsSchema, updatePostsSchema");
  });

  it("barrelEntry handles single table", () => {
    const gen = new ZodValidatorGenerator();
    const barrel = gen.barrelEntry(["users"]);
    expect(barrel).toContain("insertUsersSchema");
    expect(barrel).not.toContain("Posts");
  });
});
