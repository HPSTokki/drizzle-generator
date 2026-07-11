import { Command } from "commander";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { addCommand } from "./commands/add.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

const program = new Command();

program
  .name("drizzle-gen")
  .description("Declarative Drizzle ORM schema generator")
  .version(pkg.version);

program.addCommand(addCommand);

export async function runCli(argv: string[] = process.argv): Promise<void> {
  await program.parseAsync(argv);
}
