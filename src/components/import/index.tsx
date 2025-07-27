"use server";

import { db } from "@/lib/db";
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
      db.user.count(),
      db.revision.count(),
      db.group.count(),
      db.membership.count(),
      db.category.count(),
      db.receipt.count(),
      db.item.count(),
      db.itemShare.count(),
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
