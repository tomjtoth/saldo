import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/app/_lib/db/schema";

export const db = drizzle({
  connection:
    process.env.DATABASE_URL ??
    (process.env.NODE_ENV === "development" ? "file:data/dev.db" : "saldo.db"),
  schema,
  casing: "snake_case",
  logger: true,
  // logger: process.env.NODE_ENV === "development" ? true : false,
});
