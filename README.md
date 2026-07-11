# drizzle-gen

One-shot Drizzle ORM schema table generator. Scaffold a table schema, barrel export, and validators from a single command.

```bash
npx drizzle-gen add users -d pg -v zod
```

## Install

```bash
npm install --save-dev drizzle-gen
```

Requires `drizzle-orm` as a peer dependency (with `zod` or `typebox` optional for validator generation).

## Usage

### Add a table

```bash
drizzle-gen add <table> [options]
```

**Options:**

| Flag | Description |
|------|-------------|
| `-d, --dialect <dialect>` | Dialect: `pg`, `mysql`, `sqlite` (inferred from `drizzle.config.ts` if omitted) |
| `-v, --validator [type]` | Generate validator schema. Pass value (`zod`/`typebox`) or use flag alone for interactive prompt |
| `-o, --out <path>` | Output directory (inferred from `drizzle.config.ts` if omitted, default `./drizzle`) |

**Examples:**

```bash
drizzle-gen add users -d pg
drizzle-gen add posts -d mysql -v zod
drizzle-gen add items -d sqlite -v
drizzle-gen add products -d pg -o ./src/db/schema
drizzle-gen add products                        # infers dialect from drizzle.config.ts
```

### Generated output

Running `drizzle-gen add users -d pg -v zod` produces:

```
drizzle/
  users.ts            # Table schema
  index.ts            # Barrel export
  validations/
    users.ts          # Zod schemas (createInsertSchema, createSelectSchema, createUpdateSchema)
    index.ts          # Validator barrel export
```

### drizzle.config.ts inference

If you already have a `drizzle.config.ts` in your project, `drizzle-gen` will automatically detect your dialect and output directory — no need to pass `-d` or `-o`:

```ts
// drizzle.config.ts
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db",
};
```

```bash
drizzle-gen add products   # infers dialect: postgresql, out: ./src/db
```

## Supported dialects

- PostgreSQL (`pg`)
- MySQL (`mysql`)
- SQLite (`sqlite`)

## Supported validators

- Zod (`zod`)
- TypeBox (`typebox`)

## Development

```bash
git clone <repo>
npm install
npm run dev          # run via tsx
npm test             # vitest
npm run typecheck    # tsc --noEmit
npm run build        # tsup (esm + cjs + dts)
```
