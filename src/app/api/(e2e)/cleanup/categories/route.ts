import { db } from "@/lib/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 403 });

  const cats = await db.category.findMany({
    select: { id: true, revisionId: true },
    where: {
      name: {
        startsWith: "test-cat-",
      },
    },
  });

  const archives = await db.archive.findMany({
    select: { revisionId: true },
    where: {
      entityPk1: { in: cats.map((c) => c.id) },
    },
  });

  await db.revision.deleteMany({
    where: {
      id: {
        in: cats
          .map((c) => c.revisionId)
          .concat(archives.map((a) => a.revisionId)),
      },
    },
  });

  return new Response(null, { status: 200 });
}
