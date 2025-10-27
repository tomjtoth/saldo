import wrapRoute from "@/lib/wrapRoute";
import { truncateDb } from "@/lib/db";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  truncateDb
);
