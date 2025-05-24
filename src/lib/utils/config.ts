import { v4 as uuid } from "uuid";
import dotenv from "dotenv";

dotenv.config();
const ENV = process.env;

export const NODE_ENV = ENV.NODE_ENV || "development",
  SECRET = ENV.SECRET || uuid(),
  DB_PATH =
    NODE_ENV === "test"
      ? ":memory:"
      : ENV.DB_PATH ||
        "data/" + (NODE_ENV === "production" ? "prod.db" : "dev.db"),
  CSV_PATH = ENV.CSV_PATH || "data/saldo-v3.csv",
  EMAIL_PASS = ENV.EMAIL_PASS,
  EMAIL_FROM = ENV.EMAIL_FROM;
