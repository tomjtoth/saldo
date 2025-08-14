import { sql } from "drizzle-orm";

import { db, DrizzleTx } from ".";
import * as schema from "@/lib/db/schema";

import { datetimeFromInt } from "../utils";

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

export function atomic<T>(
  options: AtomicWithRevOpts,
  operation: AtomicFunWithRevision<T>
): Promise<T>;

export function atomic<T>(
  options: AtomicOpts,
  operation: AtomicFun<T>
): Promise<T>;

export function atomic<T>(operation: AtomicFun<T>): Promise<T>;

export async function atomic<T>(
  optsOrFn: AtomicOpts | AtomicFun<T>,
  maybeFn?: AtomicFunWithRevision<T> | AtomicFun<T>
): Promise<T> {
  const isFnOnly = typeof optsOrFn === "function";
  const opts = isFnOnly ? {} : optsOrFn;
  const operation = isFnOnly ? optsOrFn : maybeFn!;
  const {
    revisedBy,
    deferForeignKeys,
    operation: opDescription,
  } = opts as AtomicWithRevOpts;

  let revId = -1;

  try {
    const res = await db.transaction(async (tx) => {
      let res: T;

      if (revisedBy) {
        if (deferForeignKeys) await tx.run(sql`PRAGMA defer_foreign_keys = ON`);

        const [{ revisionId }] = await tx
          .insert(schema.revisions)
          .values([
            {
              createdById: revisedBy,
              createdAt: datetimeFromInt(),
            },
          ])
          .returning({ revisionId: schema.revisions.id });

        res = await (operation as AtomicFunWithRevision<T>)(tx, revisionId);
      } else res = await (operation as AtomicFun<T>)(tx);

      return res;
    });

    if (revId % DB_BACKUP_EVERY_N_REVISIONS == 0) {
      // TODO:
      // db.backup(`${DB_PATH}.backup.${rev.id}`);
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
}
