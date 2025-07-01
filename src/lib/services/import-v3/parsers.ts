import fs from "fs";
import { Readable } from "stream";
import { DateTime } from "luxon";

import csv from "csv-parser";

import { approxFloat, DT_ANCHOR, EUROPE_HELSINKI } from "../../utils";
import {
  TCrRevision,
  TCrUser,
  TCrCategory,
  TCrReceipt,
  TCrItem,
  TCrItemShare,
  TGroup,
  TMembership,
} from "@/lib/models";

export type TCsvRow = { [key: string]: string };

export type TDBData = {
  revisions: TCrRevision[];
  users: TCrUser[];
  groups: TGroup[];
  memberships: TMembership[];
  categories: TCrCategory[];
  receipts: TCrReceipt[];
  items: TCrItem[];
  itemShares: TCrItemShare[];
};

export function parseCSV(input: string, testing = false) {
  const csvRows: TCsvRow[] = [];

  return new Promise<TCsvRow[]>((done, failed) => {
    const stream = testing
      ? Readable.from([input])
      : fs.createReadStream(input);

    stream
      .pipe(csv())
      .on("data", (data) => csvRows.push(data))
      .on("end", () => done(csvRows))
      .on("error", failed);
  });
}

/**
 * v3.0 of saldo handled multiple users by a `user1 -> user2` syntax
 * 1 item could not belong to more than 2 users
 * the column `ratio` defined the share of `users[0]`,
 * examples:
 *  - `{paid_by: 0, share: "100%"}` means `users[0]` paid for themselves
 *  - `{paid_by: 1, share: "100%"}` means `users[1]` paid for `users[0]`
 *
 */
export function parseData(csvRows: TCsvRow[]): TDBData {
  const dd = {
    revisions: [],
    users: [],
    groups: [{ id: 1, name: "imported from V3", revId: 1, statusId: 1 }],
    memberships: [
      { groupId: 1, userId: 1, revId: 1, statusId: 1, admin: true },
      { groupId: 1, userId: 2, revId: 1, statusId: 1 },
      { groupId: 1, userId: 3, revId: 1, statusId: 1 },
      { groupId: 1, userId: 4, revId: 1, statusId: 1 },
    ],
    categories: [],
    receipts: [],
    items: [],
    itemShares: [],
  } as TDBData;

  csvRows.forEach((row) => {
    const {
      category: strCategory,
      date: strPaidOn,
      timestamp_of_entry: strAddedOn,
      cost: strCost,
      comment: strNotes,
      ratio: strRatio,
    } = row;

    const revOn = Math.round(
      (DateTime.fromFormat(
        strAddedOn,
        "y.M.d. H:m:s",
        EUROPE_HELSINKI
      ).toMillis() -
        DT_ANCHOR) /
        1000
    );

    let lastRev =
      dd.revisions.find((rev) => rev.revOn === revOn) ?? dd.revisions.at(-1);

    if (!lastRev || lastRev.revOn !== revOn) {
      lastRev = {
        id: dd.revisions.length + 1,
        revBy: 1,
        revOn,
      };
      dd.revisions.push(lastRev);
    }
    const revId = lastRev.id!;

    const newUser = (user: string) =>
      dd.users.push({
        id: dd.users.length + 1,
        revId,
        name: user,
        email: user + "@just.imported",
      });

    // entries contain sometimes only 1 name
    const [strPaidBy, strPaidTo = null] = row.direction.split("->");
    const paidBy =
      dd.users.find((u) => u.name === strPaidBy)?.id ?? newUser(strPaidBy);

    lastRev.revBy = paidBy;
    let userId = -1;

    if (strPaidTo) {
      const paidToUser = dd.users.find((u) => u.name === strPaidTo);
      userId = paidToUser ? paidToUser.id! : newUser(strPaidTo);
    }

    const paidOn = strPaidOn.replaceAll(".", "-").slice(0, 10);

    let lastRcpt = dd.receipts.at(-1);
    if (
      !lastRcpt ||
      revId !== lastRcpt.revId ||
      paidOn !== lastRcpt.paidOn ||
      paidBy !== lastRcpt.paidBy
    ) {
      lastRcpt = {
        id: dd.receipts.length + 1,
        revId,
        groupId: 1,
        paidOn,
        paidBy,
      };
      dd.receipts.push(lastRcpt);
    }

    const rcptId = lastRcpt.id!;

    let cat = dd.categories.find((c) => c.name === strCategory);
    if (!cat) {
      cat = {
        id: dd.categories.length + 1,
        revId,
        groupId: 1,
        name: strCategory,
      };
      dd.categories.push(cat);
    }

    const catId = cat.id!;

    const cost = parseFloat(
      strCost.replaceAll(/[^\d,.-]/g, "").replace(",", ".")
    );

    const itemId = dd.items.push({
      id: dd.items.length + 1,
      revId,
      rcptId,
      catId,
      cost,
      notes: strNotes === "" ? undefined : strNotes,
    });

    const ratio = parseFloat(strRatio) / 100;

    if (!((paidBy === 1 && ratio === 1) || (paidBy > 1 && ratio === 0))) {
      if (paidBy === 1 && ratio === 0) {
        dd.itemShares.push({
          itemId,
          userId,
          revId,
          share: 1,
        });
      }

      if (paidBy >= 2 && ratio === 1) {
        dd.itemShares.push({
          itemId,
          userId: 1,
          revId,
          share: 1,
        });
      }

      if (ratio !== 0 && ratio !== 1) {
        const [user1_share, total_shares] = approxFloat(ratio);

        dd.itemShares.push(
          {
            itemId,
            userId: 1,
            revId,
            share: user1_share,
          },
          {
            itemId,
            userId: userId > 1 ? userId : paidBy,
            revId,
            share: total_shares - user1_share,
          }
        );
      }
    }
  });

  // masking names during development
  dd.users.forEach((user, idx) => {
    user.name = "user #" + idx;
    user.email = "user" + idx + "@just.imported";
  });

  return dd;
}
