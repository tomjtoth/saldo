import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/app/_lib/db/schema";
import { getDbPath } from "./helpers";

export const db = drizzle({
  connection: getDbPath(),
  schema,
  casing: "snake_case",
  logger: true,
  // logger: process.env.NODE_ENV === "development" ? true : false,
});
