"use server";

import {
  Categories,
  Groups,
  Items,
  ItemShares,
  Memberships,
  Receipts,
  Revisions,
  Users,
} from "@/lib/models";
import { alreadyInProd } from "@/lib/services/importV3";

import CliImportSection from "./clientSide";
import { getGroups } from "@/lib/services/groups";

export default async function ImportSection() {
  let rendered = null;

  getGroups(1);

  if (!(await alreadyInProd())) {
    rendered = (
      <CliImportSection
        {...{
          revisions: Revisions.count(),
          users: Users.count(),
          groups: Groups.count(),
          memberships: Memberships.count(),
          categories: Categories.count(),
          receipts: Receipts.count(),
          items: Items.count(),
          itemShares: ItemShares.count(),
        }}
      />
    );
  }

  return rendered;
}
