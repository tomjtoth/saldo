import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 403 });

  db.transaction(() => {
    const revIds = db
      .prepare("SELECT revisionId FROM categories WHERE name LIKE 'test-cat%'")
      .pluck()
      .all() as number[];

    const stmt = db.prepare("DELETE FROM revisions WHERE id = ?");
    revIds.forEach((revId) => stmt.run(revId));
  })();

  return new Response(null, { status: 200 });
}
