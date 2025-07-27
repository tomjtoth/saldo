import { PrismaClient, Revision } from "./prisma";
import { dateFromInt, datetimeFromInt, datetimeToInt } from "./utils";

const DB_BACKUP_EVERY_N_REVISIONS = 50;

export const db = new PrismaClient().$extends({
  result: {
    receipt: {
      paidOn: {
        needs: { paidOnInt: true },
        compute: (rec) => dateFromInt(rec.paidOnInt),
      },
    },
    revision: {
      createdOn: {
        needs: { createdOnInt: true },
        compute: (rev) => datetimeFromInt(rev.createdOnInt),
      },
    },
  },
});

type PrismaTransaction = Omit<
  typeof db,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type AtomicOpts = {
  operation?: string;
};

type AtomicWithRevOpts = AtomicOpts & {
  revisedBy: number;
};

type AtomicFun<T> = (tx: PrismaTransaction) => Promise<T>;
type AtomicFunWithRevision<T> = (
  tx: PrismaTransaction,
  revision: Revision
) => Promise<T>;

export function atomic<T>(
  options: AtomicWithRevOpts,
  operation: (tx: PrismaTransaction, revision: Revision) => T
): T;

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
  const { revisedBy, operation: opDescription } = opts as AtomicWithRevOpts;

  let revId = -1;

  try {
    const res = await db.$transaction(async (tx) => {
      let res: T;

      if (revisedBy) {
        const rev = await tx.revision.create({
          data: {
            createdById: revisedBy,
            createdOnInt: datetimeToInt(),
          },
        });

        res = await (operation as AtomicFunWithRevision<T>)(tx, rev);
      } else res = await (operation as AtomicFun<T>)(tx);

      return res;
    });

    if (revId % DB_BACKUP_EVERY_N_REVISIONS == 0) {
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
