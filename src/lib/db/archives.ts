import { Prisma } from "@prisma/client";
import { db } from ".";
import { PrismaTx } from "./atomic";

export async function getArchivePopulator<T extends { archives?: T[] }>(
  tableName: string,
  pk1: keyof T,
  {
    pk2,
    tx,
  }: {
    pk2?: keyof T;
    tx?: PrismaTx;
  } = {}
) {
  const res = await (tx ?? db).$queryRaw<{ data: string }[]>(
    Prisma.sql`SELECT data FROM archives WHERE tableName = ${tableName}`
  );

  const archives =
    res.length === 0
      ? {}
      : (JSON.parse(res[0].data) as {
          [pk1: string]: {
            [pk2: string]: {
              revisionId: number;
              revision: {
                createdAt: string;
                createdAtInt: number;
                createdBy: { name: string };
              };
            } & {
              [columns: Exclude<string, "revision" | "revisionId">]:
                | number
                | string
                | null;
            }[];
          };
        });

  return function populate(arr: T[]) {
    arr.forEach((entity) => {
      const strPk1 = (entity[pk1 as keyof T] as number).toString();
      const strPk2 = pk2
        ? (entity[pk2 as keyof T] as number).toString()
        : "null";

      const restoredArchiveRows: T[] = [];

      if (archives[strPk1]) {
        archives[strPk1][strPk2].reduce((prev, rev) => {
          const curr = { ...prev, ...rev } as T;

          restoredArchiveRows.push(curr);

          return curr;
        }, entity as T);
      }

      entity.archives = restoredArchiveRows;
    });
  };
}
