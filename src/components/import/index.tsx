"use server";

import {
  Category,
  Group,
  Item,
  ItemShare,
  Membership,
  Receipt,
  Revision,
  User,
} from "@/lib/models";
import { alreadyInProd } from "@/lib/services/import-v3";

import CliImportSection from "./client-side";

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
      User.count(),
      Revision.count(),
      Group.count(),
      Membership.count(),
      Category.count(),
      Receipt.count(),
      Item.count(),
      ItemShare.count(),
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
