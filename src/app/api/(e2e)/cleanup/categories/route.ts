import { inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { archives, categories, revisions } from "@/lib/db/schema";
import { err } from "@/lib/utils";
import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute({ requireSession: false }, async () => {
  if (process.env.NODE_ENV !== "development") err(404);

  const cats = await db.query.categories.findMany({
    columns: { id: true, revisionId: true },
    where: sql`${categories.name} like 'test-cat%'`,
  });

  const catArchives = await db.query.archives.findMany({
    columns: { revisionId: true },
    where: inArray(
      archives.entityPk1,
      cats.map((c) => c.id)
    ),
  });

  await db
    .delete(revisions)
    .where(
      inArray(
        revisions.id,
        cats
          .map((c) => c.revisionId)
          .concat(catArchives.map((a) => a.revisionId))
      )
    );
});
