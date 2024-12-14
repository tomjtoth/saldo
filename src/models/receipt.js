const Generic = require("./generic");
const { sql } = require("../db");

module.exports = class Receipt extends Generic {
  static _tbl = "receipts";

  static get _validations() {
    return {
      paid_on: {
        type: Number,
        validator: /^-?\d+$/,
        defaults_to: () => new Date().epoch_date(),
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }

  static async insert({ items: req_items, paid_by, paid_on }, opts) {
    const idx_of_items_with_shares = req_items.reduce(
      (arr, { shares }, idx) => {
        if (shares !== undefined) arr.push(idx);

        return arr;
      },
      []
    );

    const [receipt] = await super.insert([
      {
        paid_by,
        paid_on,
      },
    ]);

    const items = await Item.insert(
      req_items.map(({ shares, ...item }) => ({
        ...item,
        rev_id,
        rcpt_id: receipt.id,
      }))
    );

    const item_shares = await ItemShare.insert(
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
      }, []),
      { skip_cols: [] }
    );

    return { receipt, items, item_shares };
  }
};
