import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/app/_lib/db/schema";

export const getDbPath = () =>
  process.env.DB_PATH ??
  (process.env.NODE_ENV === "development" ? "data/dev.db" : "data/saldo.db");

export const db = drizzle({
  connection: `file:${getDbPath()}`,
  schema,
  casing: "snake_case",
  logger: true,
  // logger: process.env.NODE_ENV === "development" ? true : false,
});
