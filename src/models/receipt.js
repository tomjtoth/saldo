const Generic = require("./generic");
const Item = require("./item");
const ItemShare = require("./item_share");
const { sql } = require("../db");

module.exports = class Receipt extends Generic {
  static _tbl = "receipts";

  static get _validations() {
    return {
      paid_on: {
        type: Number,
        validator: /^-?\d+$/,
        defaults_to: () => new Date().to_epoch_date(),
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }

  static insert([{ items: req_items, paid_by, paid_on }], { rev_by }) {
    const idx_of_items_with_shares = req_items.reduce(
      (arr, { shares }, idx) => {
        if (shares !== undefined) arr.push(idx);

        return arr;
      },
      []
    );

    return sql.begin(async (sql) => {
      const [{ rev_id, rcpt_id, item_id }] = await sql`select
        coalesce((select max(id) + 1 from revisions), 0)::int as rev_id,
        coalesce((select max(id) + 1 from receipts), 0)::int as rcpt_id,
        coalesce((select max(id) + 1 from items), 0)::int as item_id`;

      await sql`insert into revisions ${sql({ id: rev_id, rev_by })}`;

      const [receipt] = this.from(
        await sql`insert into receipts ${sql(
          new this({
            id: rcpt_id,
            rev_id,
            paid_on,
            paid_by,
          })
        )} returning *`
      );

      const items = Item.from(
        await sql`insert into items ${sql(
          Item.from(
            req_items.map(({ shares: _discarded_here, ...item }, i) => ({
              ...item,
              id: item_id + i,
              rev_id,
              rcpt_id,
            }))
          )
        )} returning *`
      );

      const item_shares = ItemShare.from(
        await sql`insert into item_shares ${sql(
          ItemShare.from(
            idx_of_items_with_shares.reduce((arr, idx) => {
              const item_id = items[idx].id;
              const shares = req_items[idx].shares;

              arr.push(
                ...shares.reduce((arr, share, user_id) => {
                  if (share !== null)
                    arr.push({
                      item_id,
                      user_id,
                      rev_id,
                      share,
                    });

                  return arr;
                }, [])
              );

              return arr;
            }, [])
          )
        )} returning *`
      );

      return { receipt, items, item_shares };
    });
  }

  toJSON() {
    return {
      ...this,
      paid_on: Date.from_epoch_date(this.paid_on).toISODate(),
    };
  }
};
