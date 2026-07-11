import type { DialectGenerator } from "./base.js";
import { PgGenerator } from "./pg.js";
import { MysqlGenerator } from "./mysql.js";
import { SqliteGenerator } from "./sqlite.js";

export const dialectRegistry: Record<string, DialectGenerator> = {
  postgresql: new PgGenerator(),
  mysql: new MysqlGenerator(),
  sqlite: new SqliteGenerator(),
};
