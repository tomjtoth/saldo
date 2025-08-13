"use server";

import { db, schema } from "@/lib/db";
import { alreadyInProd } from "@/lib/services/importV3";

import CliImportSection from "./clientSide";

export default async function ImportSection() {
  let rendered = null;

  if (!(await alreadyInProd())) {
    const [
      users,
      revisions,
      groups,
      memberships,
      categories,
      receipts,
      items,
      itemShares,
    ] = await Promise.all([
      db.$count(schema.users),
      db.$count(schema.revisions),
      db.$count(schema.groups),
      db.$count(schema.memberships),
      db.$count(schema.categories),
      db.$count(schema.receipts),
      db.$count(schema.items),
      db.$count(schema.itemShares),
    ]);

    rendered = (
      <CliImportSection
        {...{
          revisions,
          users,
          groups,
          memberships,
          categories,
          receipts,
          items,
          itemShares,
        }}
      />
    );
  }

  return rendered;
}
