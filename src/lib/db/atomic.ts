import { db, TRevision } from ".";
import { datetimeToInt } from "../utils";

const DB_BACKUP_EVERY_N_REVISIONS = 50;

export type PrismaTx = Omit<
  typeof db,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type AtomicOpts = {
  operation?: string;
};

type AtomicWithRevOpts = AtomicOpts & {
  revisedBy: number;
};

type AtomicFun<T> = (tx: PrismaTx) => Promise<T>;
type AtomicFunWithRevision<T> = (
  tx: PrismaTx,
  revision: Pick<TRevision, "id">
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
  const { revisedBy, operation: opDescription } = opts as AtomicWithRevOpts;

  let revId = -1;

  try {
    const res = await db.$transaction(
      async (tx) => {
        let res: T;

        if (revisedBy) {
          const rev = await tx.revision.create({
            data: {
              createdById: revisedBy,
              createdAtInt: datetimeToInt(),
            },
            select: { id: true },
          });

          revId = rev.id;

          res = await (operation as AtomicFunWithRevision<T>)(tx, rev);
        } else res = await (operation as AtomicFun<T>)(tx);

        return res;
      },
      process.env.NODE_ENV === "development" ? { timeout: 15 * 60 * 1000 } : {}
    );

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
