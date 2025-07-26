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

export default async function ImportSection() {
  let rendered = null;

  /**
 * 
 * 
 * 
 SELECT * FROM users WHERE "users".statusId = :boundParam0 AND "users".email LIKE :boundParam1 AND "users".email = :email AND "users".name <= :name_not_gt AND "users".image IN (:boundParam2, :image_IN) AND "users".id BETWEEN :boundParam3 AND :boundParam4 AND "users".id NOT IN (:boundParam5, :boundParam6, :boundParam7, :boundParam8) AND "users".id <= :boundParam9 AND ("users".name IS NOT NULL AND "users".name LIKE :boundParam10 AND "users".name > :boundParam11 OR "users".email = :boundParam12 AND ("users".email IS NULL OR "users".name IS NOT NULL) OR "users".id = :boundParam13 AND "users".email NOT LIKE :boundParam14) AND "users".revisionId = :boundParam15

 {
  boundParam0: 123,
  boundParam1: "%.com",
  boundParam2: "qweq",
  boundParam3: 10,
  boundParam4: 20,
  boundParam5: 12,
  boundParam6: 13,
  boundParam7: 14,
  boundParam8: 18,
  boundParam9: 22,
  boundParam10: "%13sad%",
  boundParam11: "null",
  boundParam12: "dfaaaf",
  boundParam13: 123,
  boundParam14: "%FAAF%",
  boundParam15: 123,
}


 */

  const tt = Users.where({
    statusId: 123,
    email: { $LIKE: "%.com", $SQL: ":email" },
    name: { $NOT: { $GT: { $SQL: ":name_not_gt" } } },
    image: { $IN: ["qweq", { $SQL: ":image_IN" }] },
    id: { $BETWEEN: [10, 20], $NOT: { $IN: [12, 13, 14, 18], $GT: 22 } },

    $EITHER: [
      { name: { $NOT: null, $LIKE: "%13sad%", $GT: "null" } },
      { email: "dfaaaf", $EITHER: [{ email: null }, { name: { $NOT: null } }] },
      { id: 123, email: { $NOT: { $LIKE: "%FAAF%" } } },
    ],

    revisionId: 123,
  })
    .innerJoin(Revisions.orderBy("createdOn"))
    .orderBy("id", { col: "revisionId", direction: "DESC", fn: "LOWER" })
    .prepare();

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
