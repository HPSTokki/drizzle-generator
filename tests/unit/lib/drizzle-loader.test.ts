import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { tryLoadDrizzleConfig } from "../../../src/lib/drizzle-loader.js";

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "drizzle-gen-test-"));
}

describe("tryLoadDrizzleConfig", () => {
  it("returns null when no config file exists", async () => {
    const dir = tempDir();
    try {
      const result = await tryLoadDrizzleConfig(dir);
      expect(result).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads config from drizzle.config.ts", async () => {
    const dir = tempDir();
    try {
      writeFileSync(
        join(dir, "drizzle.config.ts"),
        `export default {\n  dialect: 'postgresql',\n  out: './drizzle',\n  schema: './src/schema.ts',\n};\n`,
      );
      const result = await tryLoadDrizzleConfig(dir);
      expect(result).not.toBeNull();
      expect(result!.dialect).toBe("postgresql");
      expect(result!.out).toBe("./drizzle");
      expect(result!.schema).toBe("./src/schema.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("loads config from drizzle.config.js", async () => {
    const dir = tempDir();
    try {
      writeFileSync(
        join(dir, "drizzle.config.js"),
        `module.exports = {\n  dialect: 'mysql',\n  out: './src/db',\n};\n`,
      );
      const result = await tryLoadDrizzleConfig(dir);
      expect(result).not.toBeNull();
      expect(result!.dialect).toBe("mysql");
      expect(result!.out).toBe("./src/db");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("resolves schema when it is a string array", async () => {
    const dir = tempDir();
    try {
      writeFileSync(
        join(dir, "drizzle.config.ts"),
        `export default {\n  dialect: 'sqlite',\n  schema: ['./src/table1.ts', './src/table2.ts'],\n};\n`,
      );
      const result = await tryLoadDrizzleConfig(dir);
      expect(result).not.toBeNull();
      expect(result!.dialect).toBe("sqlite");
      expect(Array.isArray(result!.schema)).toBe(true);
      expect((result!.schema as string[])[0]).toBe("./src/table1.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prefers drizzle.config.ts over drizzle.config.js", async () => {
    const dir = tempDir();
    try {
      writeFileSync(join(dir, "drizzle.config.js"), `module.exports = { dialect: 'mysql' };\n`);
      writeFileSync(join(dir, "drizzle.config.ts"), `export default { dialect: 'postgresql' };\n`);
      const result = await tryLoadDrizzleConfig(dir);
      expect(result).not.toBeNull();
      expect(result!.dialect).toBe("postgresql");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
