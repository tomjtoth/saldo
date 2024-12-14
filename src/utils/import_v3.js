const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuid } = require("uuid");
const { sql, reset_db, in_chunks } = require("../db");
const approximate_float = require("./approximate_float");
const {
  statuses: Status,
  users: User,
  categories: Category,
  items: Item,
  receipts: Receipt,
  item_shares: ItemShare,
  revisions: Revision,
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
    revisions = [],
    users = [],
    categories = [],
    receipts = [],
    items = [],
    item_shares = [];

  fs.createReadStream(path_to_csv)
    .pipe(csv())
    .on("data", (data) => csv_rows.push(data))
    .on("end", async () => {
      csv_rows.forEach((row) => {
        const {
          category: str_cat,
          date: str_paid_on,
          timestamp_of_entry: str_added_on,
          cost: str_cost,
          comment: str_notes,
          ratio: str_ratio,
        } = row;

        // TODO: revisions could be reduced, because some receipts were added in a batch
        // last_rev = revisions.find(r => r.rev_on === rev_on)
        const rev_on = new Date(str_added_on).epoch();

        let rev_id = revisions.length - 1;
        let last_rev = revisions[rev_id];

        if (!last_rev || last_rev.rev_on !== rev_on) {
          last_rev = new Revision({
            id: revisions.length,
            rev_by: 0,
            rev_on,
          });
          rev_id = revisions.push(last_rev) - 1;
        }

        // entries contain sometimes only 1 name
        const [str_paid_by, str_paid_to = null] = row.direction.split("->");

        const paid_by_user = users.find((u) => u.name === str_paid_by);
        const paid_by = paid_by_user
          ? paid_by_user.id
          : users.push(
              new User({
                id: users.length,
                rev_id,
                name: str_paid_by,
                email: str_paid_by + "@just.imported",
                passwd: uuid(),
              })
            ) - 1;

        last_rev.rev_by = paid_by;
        let paid_to = -1;

        if (str_paid_to) {
          const paid_to_user = users.find((u) => u.name === str_paid_to);
          paid_to = paid_to_user
            ? paid_to_user.id
            : users.push(
                new User({
                  id: users.length,
                  rev_id,
                  name: str_paid_to,
                  email: str_paid_to + "@just.imported",
                  passwd: uuid(),
                })
              ) - 1;
        }

        const paid_on = new Date(str_paid_on).epoch_date();

        let rcpt_id = receipts.length - 1;
        const last_rcpt = receipts[rcpt_id];
        if (
          !last_rcpt ||
          paid_on !== last_rcpt.paid_on ||
          rev_id !== last_rcpt.rev_id
        ) {
          rcpt_id =
            receipts.push(
              new Receipt({
                id: receipts.length,
                rev_id,
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
                rev_id,
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
              rev_id,
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
                rev_id,
                share: 1,
              })
            );
          }

          if (paid_by >= 1 && ratio === 1) {
            item_shares.push(
              new ItemShare({
                item_id,
                user_id: 0,
                rev_id,
                share: 1,
              })
            );
          }

          if (ratio !== 0 && ratio !== 1) {
            const [user0_share, total_shares] = approximate_float(ratio);

            item_shares.push(
              new ItemShare({
                item_id,
                user_id: 0,
                rev_id,
                share: user0_share,
              }),
              new ItemShare({
                item_id,
                user_id: paid_to > 0 ? paid_to : paid_by,
                rev_id,
                share: total_shares - user0_share,
              })
            );
          }
        }
      });

      await reset_db();
      await Promise.all(users.map((u) => u.hash()));

      // keeping class Backend simple, that's why the raw sql here
      const results = await sql.begin((sql) => [
        sql`insert into revisions ${sql(revisions)}`,
        sql`insert into users ${sql(users)}`,
        sql`insert into categories ${sql(categories)}`,

        ...in_chunks(
          receipts,
          (chunk) => sql`insert into receipts ${sql(chunk)}`
        ),
        ...in_chunks(items, (chunk) => sql`insert into items ${sql(chunk)}`),
        ...in_chunks(
          item_shares,
          (chunk) => sql`insert into item_shares ${sql(chunk)}`
        ),
      ]);

      results.map((res) => {
        const op = res.statement.string.match(/(\S+) (\S+ \S+)/);

        console.log(`${op[1]}ed ${res.count} rows ${op[2]}`);
      });
      console.log("\n\tSUCCESSFULLY IMPORTED V3\n");
      process.exit(0);
    });
};
