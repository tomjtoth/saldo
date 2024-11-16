const fs = require("fs");
const csv = require("csv-parser");
const db = require("../db");
const approximate_float = require("./approximate_float");
const insert_in_batches = require("./insert_in_batches");
const {
  users: User,
  categories: Category,
  items: Item,
  receipts: Receipt,
  item_shares: ItemShare,
} = require("../models");
/**
 * v3.0 of saldo handled multiple users by a `user1 -> user2` syntax
 * 1 item could not belong to more than 2 users
 * the column `ratio` defined the share of `users[0]`,
 * examples:
 *  - `{paid_by: 0, share: "100%"}` means `users[0]` paid for themselves
 *  - `{paid_by: 1, share: "100%"}` means `users[1]` paid for `users[0]`
 *
 * @param {string} path_to_csv
 */
module.exports = function (path_to_csv) {
  const csv_rows = [],
    users = [],
    categories = [],
    receipts = [],
    items = [],
    item_shares = [];

  fs.createReadStream(path_to_csv)
    .pipe(csv())
    .on("data", (data) => csv_rows.push(data))
    .on("end", () => {
      csv_rows.forEach((row) => {
        const {
          category: str_cat,
          date: str_paid_on,
          timestamp_of_entry: str_added_on,
          cost: str_cost,
          comment: str_notes,
          ratio: str_ratio,
        } = row;

        // entries contain sometimes only 1 name
        const [str_paid_by, str_paid_to = null] = row.direction.split("->");

        const paid_by_user = users.find((u) => u.name === str_paid_by);
        const paid_by = paid_by_user
          ? paid_by_user.id
          : users.push(
              new User({
                id: users.length,
                name: str_paid_by,
                email: str_paid_by + "@just.imported",
              })
            ) - 1;

        let paid_to = -1;

        if (str_paid_to) {
          const paid_to_user = users.find((u) => u.name === str_paid_to);
          paid_to = paid_to_user
            ? paid_to_user.id
            : users.push(
                new User({
                  id: users.length,
                  name: str_paid_to,
                  email: str_paid_to + "@just.imported",
                })
              ) - 1;
        }

        const added_on = new Date(str_added_on).toISOString();
        const paid_on = str_paid_on.split(".", 3).join("-");

        let rcpt_id = receipts.length - 1;
        const last_r = receipts[rcpt_id];
        if (
          !last_r ||
          paid_on !== last_r.paid_on ||
          added_on !== last_r.added_on ||
          paid_by !== last_r.paid_by
        ) {
          rcpt_id =
            receipts.push(
              new Receipt({
                id: receipts.length,
                added_on,
                added_by: paid_by,
                paid_on,
                paid_by,
              })
            ) - 1;
        }

        const cat_id = categories.find((c) => c.category === str_cat)
          ? categories.findIndex((c) => c.category === str_cat)
          : categories.push(
              new Category({
                id: categories.length,
                category: str_cat,
              })
            ) - 1;

        const cost = Math.round(
          // `select sum(item_cost) from items` comes €0,22 near the value in Google Sheets
          parseFloat(str_cost.replaceAll(/[\s€]/g, "").replace(",", ".")) * 100
        );

        const item_id =
          items.push(
            new Item({
              id: items.length,
              rcpt_id,
              cat_id,
              cost,
              notes: str_notes == "" ? null : str_notes,
            })
          ) - 1;

        const ratio = parseFloat(str_ratio) / 100;

        if (!(paid_by === 0 && ratio === 1) || !(paid_by >= 1 && ratio === 0)) {
          if (paid_by === 0 && ratio === 0) {
            item_shares.push(
              new ItemShare({
                item_id,
                user_id: paid_to,
                share: 1,
              })
            );
          }

          if (paid_by >= 1 && ratio === 1) {
            item_shares.push(
              new ItemShare({
                item_id,
                user_id: 0,
                share: 1,
              })
            );
          }

          if (![0, 1].includes(ratio)) {
            const [user0_share, total_shares] = approximate_float(ratio);

            item_shares.push(
              new ItemShare({
                item_id,
                user_id: 0,
                share: user0_share,
              }),
              new ItemShare({
                item_id,
                user_id: paid_to > 0 ? paid_to : paid_by,
                share: total_shares - user0_share,
              })
            );
          }
        }
      });

      db.serialize(() => {
        db.run("insert into statuses(id, status) values (0, 'current')");

        insert_in_batches("users", users);
        insert_in_batches("categories", categories);
        insert_in_batches("receipts", receipts);
        insert_in_batches("items", items);
        insert_in_batches("item_shares", item_shares);
      });
    });
};
