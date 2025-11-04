import wrapRoute from "@/app/_lib/wrapRoute";
import { truncateDb } from "@/app/_lib/db";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  truncateDb
);
