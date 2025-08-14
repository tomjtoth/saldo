import { db } from "@/lib/db";
import { revisions } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

export async function GET() {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 403 });

  const cats = await db.query.categories.findMany({
    columns: { id: true, revisionId: true },
    where: (t, o) => o.sql`${t.name} like 'test-cat%'`,
  });

  const archives = await db.query.archives.findMany({
    columns: { revisionId: true },
    where: (t, o) =>
      o.inArray(
        t.entityPk1,
        cats.map((c) => c.id)
      ),
  });

  await db
    .delete(revisions)
    .where(
      inArray(
        revisions.id,
        cats.map((c) => c.revisionId).concat(archives.map((a) => a.revisionId))
      )
    );

  return new Response(null, { status: 200 });
}
