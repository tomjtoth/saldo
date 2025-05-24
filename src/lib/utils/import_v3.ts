"use server";

import fs from "fs";

import { hashSync } from "bcrypt";
import csv from "csv-parser";
import { v4 as uuid } from "uuid";

import { CSV_PATH } from "./config";
import {
  db,

  // types
  TRevision,
  TUser,
  TCategory,
  TReceipt,
  TItem,
  TItemShare,

  // tables
  Revision,
  User,
  Category,
  Receipt,
  Item,
  ItemShare,
} from "@/lib/models";
import { dateAsInt, approxFloat } from ".";

/**
 * v3.0 of saldo handled multiple users by a `user1 -> user2` syntax
 * 1 item could not belong to more than 2 users
 * the column `ratio` defined the share of `users[0]`,
 * examples:
 *  - `{paid_by: 0, share: "100%"}` means `users[0]` paid for themselves
 *  - `{paid_by: 1, share: "100%"}` means `users[1]` paid for `users[0]`
 *
 */
export async function importV3() {
  const csvRows: { [key: string]: string }[] = [],
    revisions: TRevision[] = [],
    users: TUser[] = [],
    categories: TCategory[] = [],
    receipts: TReceipt[] = [],
    items: TItem[] = [],
    itemShares: TItemShare[] = [];

  return new Promise<void>((done, failed) => {
    fs.createReadStream(CSV_PATH!)
      .pipe(csv())
      .on("data", (data) => csvRows.push(data))
      .on("end", async () => {
        csvRows.forEach((row) => {
          const {
            category: strCategory,
            date: strPaidOn,
            timestamp_of_entry: strAddedOn,
            cost: strCost,
            comment: strNotes,
            ratio: strRatio,
          } = row;

          const revOn = new Date(strAddedOn).valueOf();

          let lastRev =
            revisions.find((rev) => rev.revOn === revOn) ?? revisions.at(-1);

          if (!lastRev || lastRev.revOn !== revOn) {
            lastRev = {
              id: revisions.length + 1,
              revBy: 1,
              revOn,
            };
            revisions.push(lastRev);
          }
          const revId = lastRev.id;

          const newUser = (user: string) =>
            users.push({
              id: users.length + 1,
              revId,
              name: user,
              email: user + "@just.imported",
              passwd: hashSync(uuid(), 10),
            });

          // entries contain sometimes only 1 name
          const [strPaidBy, strPaidTo = null] = row.direction.split("->");
          const paidByUser = users.find((u) => u.name === strPaidBy);
          const paidBy = paidByUser ? paidByUser.id! : newUser(strPaidBy);

          lastRev.revBy = paidBy;
          let userId = -1;

          if (strPaidTo) {
            const paidToUser = users.find((u) => u.name === strPaidTo);
            userId = paidToUser ? paidToUser.id! : newUser(strPaidTo);
          }

          const paidOn = dateAsInt(new Date(strPaidOn));

          let lastRcpt = receipts.at(-1);
          if (
            !lastRcpt ||
            paidOn !== lastRcpt.paidOn ||
            revId !== lastRcpt.revId
          ) {
            lastRcpt = {
              id: receipts.length + 1,
              revId,
              paidOn,
              paidBy,
            };
            receipts.push(lastRcpt);
          }

          const rcptId = lastRcpt.id!;

          let cat = categories.find((c) => c.description === strCategory);
          if (!cat) {
            cat = {
              id: categories.length + 1,
              revId,
              description: strCategory,
            };
            categories.push(cat);
          }

          const catId = cat.id!;

          const cost = Math.round(
            // `select sum(item_cost) from items` comes €0,22 near the value in Google Sheets
            parseFloat(strCost.replaceAll(/[\s€]/g, "").replace(",", ".")) * 100
          );

          const itemId = items.push({
            id: items.length + 1,
            revId,
            rcptId,
            catId,
            cost,
            notes: strNotes === "" ? undefined : strNotes,
          });

          const ratio = parseFloat(strRatio) / 100;

          if (!((paidBy === 1 && ratio === 1) || (paidBy > 1 && ratio === 0))) {
            if (paidBy === 1 && ratio === 0) {
              itemShares.push({
                itemId,
                userId,
                revId,
                share: 1,
              });
            }

            if (paidBy >= 2 && ratio === 1) {
              itemShares.push({
                itemId,
                userId: 1,
                revId,
                share: 1,
              });
            }

            if (ratio !== 0 && ratio !== 1) {
              const [user1_share, total_shares] = approxFloat(ratio);

              itemShares.push(
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

        // drop ALL imported data
        await Revision.truncate();

        const transaction = await db.transaction();

        try {
          await Revision.bulkCreate(revisions, { transaction });
          await User.bulkCreate(users, { transaction });
          await Category.bulkCreate(categories, { transaction });
          await Receipt.bulkCreate(receipts, { transaction });
          await Item.bulkCreate(items, { transaction });
          await ItemShare.bulkCreate(itemShares, { transaction });

          await transaction.commit();
          console.log("\n\tSUCCESSFULLY IMPORTED V3\n");
          done();
        } catch (err) {
          await transaction.rollback();
          console.error(err);
          failed(err);
        }
      });
  });
}
