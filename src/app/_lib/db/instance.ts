import { drizzle } from "drizzle-orm/libsql";
import { relations } from "./relations";

export const getDbPath = (withProtocol = false) => {
  const path: string | undefined =
    process.env.DB_PATH ??
    (process.env.NODE_ENV === "development" ? "data/dev.db" : undefined);

  return (
    // keep :memory: as fallback, because build fails in GHA otherwise...
    path && path !== ":memory:"
      ? withProtocol
        ? "file:" + path
        : path
      : ":memory:"
  );
};

export const db = drizzle({
  connection: getDbPath(true),
  relations,
  casing: "snake_case",
  logger: process.env.NODE_ENV === "development",
});
