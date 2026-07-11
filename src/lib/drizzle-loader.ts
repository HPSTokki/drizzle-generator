import { existsSync } from "node:fs";
import { join } from "node:path";
import { createJiti } from "jiti";
import { warn } from "./output.js";

const DRIZZLE_CONFIG_NAMES = [
  "drizzle.config.ts",
  "drizzle.config.js",
  "drizzle.config.mjs",
];

export interface DrizzleConfig {
  dialect?: string;
  schema?: string | string[];
  out?: string;
  driver?: string;
}

export async function tryLoadDrizzleConfig(cwd: string): Promise<DrizzleConfig | null> {
  const configPath = DRIZZLE_CONFIG_NAMES.map((name) => join(cwd, name)).find(
    (p) => existsSync(p),
  );
  if (!configPath) return null;

  try {
    const jiti = createJiti(cwd, { interopDefault: true });
    const mod = await jiti.import(configPath);
    const modDefault = (mod as Record<string, unknown>).default;
    if (typeof modDefault === "object" && modDefault !== null) {
      return modDefault as DrizzleConfig;
    }
    return null;
  } catch (err) {
    warn(`Failed to load ${configPath}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
