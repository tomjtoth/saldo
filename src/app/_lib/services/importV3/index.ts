"use server";

import { and, eq, ne } from "drizzle-orm";

import { db, inChunks } from "@/app/_lib/db";
import * as schema from "@/app/_lib/db/schema";
import { err } from "@/app/_lib/utils";
import { parseCSV, parseData, TDBData } from "./parsers";
import { FromDB } from "@/app/_components/import/clientSide";

export const alreadyInProd = async () => {
  const user = await db.query.users.findFirst({
    columns: { id: true },
    where: and(
      eq(schema.users.id, 1),
      ne(schema.users.email, "user1@just.imported")
    ),
  });

  return !!user;
};

export async function svcImportV3() {
  if (await alreadyInProd()) err(403, "already in production");

  const read = await parseCSV(process.env.CSV_PATH || "data/saldo-v3.csv");
  const parsed = parseData(read);
  return await insertData(parsed);
}

export async function insertData(data: TDBData) {
  await db.transaction(async (tx) => {
    await tx.delete(schema.revisions);

    await tx.run("PRAGMA defer_foreign_keys = ON");

    await tx.insert(schema.revisions).values(data.revisions);
    await tx.insert(schema.users).values(data.users);
    await tx.insert(schema.groups).values(data.groups);
    await tx.insert(schema.memberships).values(data.memberships);
    await tx.insert(schema.categories).values(data.categories);
    await tx.insert(schema.receipts).values(data.receipts);

    await inChunks(
      (chunk) => tx.insert(schema.items).values(chunk),
      data.items,
      7
    );

    await inChunks(
      (chunk) => tx.insert(schema.itemShares).values(chunk),
      data.itemShares,
      5
    );
  });

  return Object.fromEntries(
    Object.entries(data).map(([key, arr]) => [key, arr.length])
  ) as FromDB;
}
