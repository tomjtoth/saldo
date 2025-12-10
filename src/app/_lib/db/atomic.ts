import fs from "fs";
import { sql } from "drizzle-orm";

import { VDate } from "../utils";
import { db, getDbPath } from "./instance";
import { schema } from "./relations";
import { DbRevision, DbUser, DrizzleTx } from "./types";

const DB_BACKUP_EVERY_N_REVISIONS = 50;

type Operation<T> = (tx: DrizzleTx, revisionId: DbRevision["id"]) => Promise<T>;

export async function atomic<T>(
  revisedById: DbUser["id"],
  operation: Operation<T>
): Promise<T> {
  let revisionId = -1;

  const res = await db.transaction(async (tx) => {
    if (revisedById === -1) await tx.run(sql`PRAGMA defer_foreign_keys = ON`);

    [{ revisionId }] = await tx
      .insert(schema.revisions)
      .values([
        {
          createdById: revisedById,
          createdAt: VDate.timeToStr(),
        },
      ])
      .returning({ revisionId: schema.revisions.id });

    return operation(tx, revisionId);
  });

  if (
    process.env.NODE_ENV === "production" &&
    revisionId % DB_BACKUP_EVERY_N_REVISIONS === 0
  ) {
    const dbPath = getDbPath();
    fs.copyFileSync(dbPath, `${dbPath}.at.${revisionId}`);
  }

  return res;
}
