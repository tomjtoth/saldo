"use server";

import { db } from "@/lib/db";
import { parseCSV, parseData, TDBData } from "./parsers";
import { Prisma } from "@prisma/client";

export const alreadyInProd = async () => {
  const user = await db.user.findFirst({
    where: { id: 1, email: { not: "user0@just.imported" } },
  });

  return !!user;
};

export async function importV3() {
  const read = await parseCSV(process.env.CSV_PATH || "data/saldo-v3.csv");
  const parsed = parseData(read);
  return await insertData(parsed);
}

export async function insertData(data: TDBData) {
  await db.$transaction([
    db.$queryRaw(Prisma.sql`PRAGMA defer_foreign_keys = ON;`),
    db.revision.deleteMany(),

    db.revision.createMany({ data: data.revisions }),
    db.user.createMany({ data: data.users }),
    db.group.createMany({ data: data.groups }),
    db.membership.createMany({ data: data.memberships }),
    db.category.createMany({ data: data.categories }),
    db.receipt.createMany({ data: data.receipts }),
    db.item.createMany({ data: data.items }),
    db.itemShare.createMany({ data: data.itemShares }),
  ]);

  return Object.fromEntries(
    Object.entries(data).map(([key, arr]) => [key, arr.length])
  );
}
