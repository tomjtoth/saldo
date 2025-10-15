import { db } from "@/lib/db";
import { revisions } from "@/lib/db/schema";
import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    await db.delete(revisions);
  }
);
