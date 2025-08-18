import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { archives, revisions } from "@/lib/db/schema";
import { err } from "@/lib/utils";
import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute({ withoutUser: true }, async () => {
  if (process.env.NODE_ENV !== "development") err(403);

  const cats = await db.query.categories.findMany({
    columns: { id: true, revisionId: true },
    where: (t, o) => o.sql`${t.name} like 'test-cat%'`,
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
