import protectedRoute from "@/lib/protectedRoute";
import { truncateDb } from "@/lib/db";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  truncateDb
);
