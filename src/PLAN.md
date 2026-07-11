# TODO

## Validator support
- [x] Zod
- [x] TypeBox
- [ ] Valibot
- [ ] ArkType
- [ ] Custom validator plugin system

## Dialect support
- [x] PostgreSQL
- [x] MySQL
- [x] SQLite
- [ ] Turso / libsql
- [ ] Neon
- [ ] PlanetScale
- [ ] D1

## Features
- [ ] `drizzle-generators init` — scaffold full project structure
- [ ] `drizzle-generators generate` — batch generate all tables from a config file
- [ ] Custom column type mappings (configurable via `drizzle-generators.config.ts`)
- [ ] Casing options (snake_case / camelCase) per table or global
- [ ] `--dry-run` flag to preview output without writing files
- [ ] Interactive table builder (guided column-by-column prompts)
- [ ] Watch mode — regenerate on config change
- [ ] Migration helper — generate migrations alongside schemas
- [ ] Relation builder — define and generate relations between tables
