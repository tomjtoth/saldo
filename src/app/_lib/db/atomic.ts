import fs from "fs";
import { sql } from "drizzle-orm";

import { VDate } from "../utils";
import { db } from "./instance";
import * as schema from "./schema";
import { DrizzleTx } from "./types";
import { getDbPath } from "./helpers";

const DB_BACKUP_EVERY_N_REVISIONS = 50;

type AtomicOpts = {
  operation?: string;
};

type AtomicWithRevOpts = AtomicOpts & {
  revisedBy: number;
  deferForeignKeys?: true;
};

type AtomicFun<T> = (tx: DrizzleTx) => Promise<T>;
type AtomicFunWithRevision<T> = (
  tx: DrizzleTx,
  revisionId: number
) => Promise<T>;

type Overloads = {
  <T>(
    options: AtomicWithRevOpts,
    operation: AtomicFunWithRevision<T>
  ): Promise<T>;

  <T>(options: AtomicOpts, operation: AtomicFun<T>): Promise<T>;

  <T>(operation: AtomicFun<T>): Promise<T>;
};

export const atomic: Overloads = async <T>(
  optsOrFn: AtomicOpts | AtomicFun<T>,
  maybeFn?: AtomicFunWithRevision<T> | AtomicFun<T>
): Promise<T> => {
  const isFnOnly = typeof optsOrFn === "function";
  const opts = isFnOnly ? {} : optsOrFn;
  const operation = isFnOnly ? optsOrFn : maybeFn!;
  const {
    revisedBy,
    deferForeignKeys,
    operation: opDescription,
  } = opts as AtomicWithRevOpts;

  let revisionId = -1;

  try {
    const res = await db.transaction(async (tx) => {
      let res: T;

      if (revisedBy) {
        if (deferForeignKeys) await tx.run(sql`PRAGMA defer_foreign_keys = ON`);

        [{ revisionId }] = await tx
          .insert(schema.revisions)
          .values([
            {
              createdById: revisedBy,
              createdAt: VDate.timeToStr(),
            },
          ])
          .returning({ revisionId: schema.revisions.id });

        res = await (operation as AtomicFunWithRevision<T>)(tx, revisionId);
      } else res = await (operation as AtomicFun<T>)(tx);

      return res;
    });

    if (revisionId % DB_BACKUP_EVERY_N_REVISIONS === 0) {
      const dbPath = getDbPath();
      fs.copyFileSync(dbPath, `${dbPath}.at.${revisionId}`);
    }

    console.log(`\n\t${opDescription ?? "Transaction"} succeeded!\n`);

    return res;
  } catch (err) {
    console.error(
      `\n\t${opDescription ?? "Transaction"} failed:`,
      (err as Error).message,
      "\n"
    );
    throw err;
  }
};
