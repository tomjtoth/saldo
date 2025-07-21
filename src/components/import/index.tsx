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
import { datetimeToInt, dateToInt } from "@/lib/utils";

export default async function ImportSection() {
  let rendered = null;

  const user_rev_user = Users.select("email")
    .innerJoin(
      Revisions.where({
        revisedOn: datetimeToInt("2020-01-01T05:30:00Z"),
        revisedBy: 12,
        $OR: [{ id: { $NOT: null, $GE: 12 } }],
      }).innerJoin(Users.select("name"))
    )
    .where({ email: { $GT: "1" } });

  const a = Users.select("email");
  const b = Revisions.where({ revisedBy: { $SQL: ":qwe" } });
  const c = Users.select("name");
  const d = b.innerJoin(c);
  const final = a.innerJoin(d);
  const getter = final.get();

  Users.select("id").where({
    $OR: [{ id: { $LE: 10 } }, { id: {} }],
  });

  Receipts.where({ paidOn: { $LT: dateToInt("2020-02-01") } }).get();

  const getUsername = Users.select("name")
    .innerJoin(
      Revisions.where({
        id: { $SQL: ":revisionId" },
        $OR: [
          {
            revisedBy: { $NOT: 12 },
          },
          {
            revisedOn: { $BETWEEN: [123, 321], $NOT: 200 },

            $OR: [{}],
          },
        ],
      })
    )
    .get();

  const getRevOn = Revisions.select("revisedOn")
    .where({
      id: { $GT: { $SQL: ":revisionId" } },
    })
    .get();

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
