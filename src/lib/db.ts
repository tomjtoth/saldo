import { Category, PrismaClient, Revision, User } from "./prisma";
import { dateFromInt, datetimeToInt } from "./utils";

const DB_BACKUP_EVERY_N_REVISIONS = 50;

const x:Category = {}

export const db = new PrismaClient().$extends({
  query: {
    receipt: {
      async findMany({ model, operation, args, query }) {
        const receipts = await query(args);

        receipts.forEach((receipt) => {
          if (receipt.paidOn) receipt.paidOn = dateFromInt(receipt.paidOn),
        })


        return receipts
      },
    },
  },
});

type AtomicOpts = {
  operation?: string;
  transaction?: "deferred" | "immediate" | "exclusive";
};

type AtomicWithRevOpts = AtomicOpts & {
  revisedBy: number;
};

type AtomicFun = (db: PrismaClient) => Promise<T>;

export function atomic<T>(
  options: AtomicWithRevOpts,
  operation: (db: PrismaClient, revision: Revision) => T
): T;

export function atomic<T>(
  options: AtomicOpts,
  operation: () => Promise<T>
): Promise<T>;

export function atomic<T>(
  operation: (db: PrismaClient) => Promise<T>
): Promise<T>;

export function atomic<T>(
  optsOrFn: AtomicOpts | ((db: PrismaClient) => Promise<T>),
  maybeFn?:
    | ((db: PrismaClient, revision: Revision) => Promise<T>)
    | ((db: PrismaClient) => Promise<T>)
): Promise<T> {
  const isFnOnly = typeof optsOrFn === "function";
  const opts = isFnOnly ? {} : optsOrFn;
  const operation = isFnOnly ? optsOrFn : maybeFn!;
  const {
    revisedBy,
    operation: opDescription,
    transaction: mode,
  } = opts as AtomicWithRevOpts;

  let revId = -1;

  try {
    const res = db.$transaction(async (db) => {
      let res: T;

      if (revisedBy) {
        const rev = await db.revision.create({
          data: {
            revisedById: revisedBy,
            revisedOn: datetimeToInt(),
          },
        });

        res = (operation as (db, rev: Revision) => T)(rev);
      } else res = (operation as () => T)(db);

      return res;
    });

    // if (revId % DB_BACKUP_EVERY_N_REVISIONS == 0)
    //   db.backup(`${DB_PATH}.backup.${rev.id}`);

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
