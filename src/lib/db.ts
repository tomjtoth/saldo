import fs from "fs";

import Database from "better-sqlite3";


const DB_PATH =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DB_PATH ||
      `data/${process.env.NODE_ENV === "production" ? "prod" : "dev"}.db`;

export const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");
