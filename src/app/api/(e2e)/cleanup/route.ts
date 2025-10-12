import { db } from "@/lib/db";
import { revisions } from "@/lib/db/schema";
import { err } from "@/lib/utils";
import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute({ requireSession: false }, async () => {
  if (process.env.NODE_ENV !== "development") err(404);

  await db.delete(revisions);
});
