const fs = require("fs");
const csv = require("csv-parser");
const db = require("../db");
const approximate_float = require("./approximate_float");
const insert_in_batches = require("./insert_in_batches");

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
function import_v3(path_to_csv) {
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

        const cat_id = categories.includes(str_cat)
          ? categories.indexOf(str_cat)
          : categories.push(str_cat) - 1;

        // entries contain sometimes only 1 name
        const [str_paid_by, str_paid_to = null] = row.direction.split("->");

        if (!users.includes(str_paid_by)) users.push(str_paid_by);
        if (str_paid_to && !users.includes(str_paid_to))
          users.push(str_paid_to);

        const paid_by = users.indexOf(str_paid_by);
        const paid_to = str_paid_to ? users.indexOf(str_paid_to) : -1;

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
          receipts.push({
            added_on,
            paid_on,
            paid_by,
          });
          rcpt_id++;
        }

        const cost = Math.round(
          // omitting "€" sign
          parseFloat(str_cost.replace("€", "").replace(",", ".")) * 100
        );

        const item_id =
          items.push({
            rcpt_id,
            cat_id,
            cost,
            notes: str_notes == "" ? null : str_notes,
          }) - 1;

        const ratio = parseFloat(str_ratio) / 100;

        if (!(paid_by === 0 && ratio === 1) || !(paid_by >= 1 && ratio === 0)) {
          if (paid_by === 0 && ratio === 0) {
            item_shares.push({
              item_id,
              item_share_of: paid_to,
              item_share: 1,
            });
          }

          if (paid_by >= 1 && ratio === 1) {
            item_shares.push({
              item_id,
              item_share_of: 0,
              item_share: 1,
            });
          }

          if (![0, 1].includes(ratio)) {
            const [user0_share, total_shares] = approximateFloat(ratio);

            item_shares.push(
              {
                item_id,
                item_share_of: 0,
                item_share: user0_share,
              },
              {
                item_id,
                item_share_of: paid_to > 0 ? paid_to : paid_by,
                item_share: total_shares - user0_share,
              }
            );
          }
        }
      });

      db.serialize(() => {
        insert_in_batches(
          "users",
          "user_id,user_name",
          users.map((name, idx) => [idx, name])
        );

        insert_in_batches(
          "categories",
          "cat_id,cat_name",
          categories.map((name, idx) => [idx, name])
        );

        insert_in_batches(
          "receipts",
          "rcpt_id,added_on,added_by,paid_on,paid_by",
          receipts.map((r, r_id) => [
            r_id,
            r.added_on,
            r.added_by || r.paid_by,
            r.paid_on,
            r.paid_by,
          ])
        );

        insert_in_batches(
          "items",
          "item_id,rcpt_id,cat_id,cost,notes",
          items.map((i, idx) => [idx, i.rcpt_id, i.cat_id, i.cost, i.notes])
        );

        insert_in_batches(
          "item_shares",
          "item_id,item_share_of,item_share",
          item_shares.map((i) => [i.item_id, i.item_share_of, i.item_share])
        );
      });
      // process.exit(0);
    });
}

module.exports = import_v3;
