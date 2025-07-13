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

import CliImportSection, { TCliImportProps } from "./clientSide";

export default async function ImportSection() {
  let rendered = null;

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
