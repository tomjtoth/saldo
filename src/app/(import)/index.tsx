"use server";

import { db } from "@/app/_lib/db";
import * as schema from "@/app/_lib/db/schema";
import { alreadyInProd } from "@/app/_lib/services";

import CliImportSection from "./_components";

export default async function ImportSection() {
  const migratedToProd = await alreadyInProd();

  return migratedToProd ? null : (
    <CliImportSection
      {...{
        revisions: await db.$count(schema.revisions),
        users: await db.$count(schema.users),
        groups: await db.$count(schema.groups),
        memberships: await db.$count(schema.memberships),
        categories: await db.$count(schema.categories),
        receipts: await db.$count(schema.receipts),
        items: await db.$count(schema.items),
        itemShares: await db.$count(schema.itemShares),
      }}
    />
  );
}
