const Generic = require("./generic");
const { begin, commit, rollback } = require("../db");
const Item = require("./item");
const ItemShare = require("./item_share");

module.exports = class Receipt extends Generic {
  static _tbl = "receipts";

  static get _validations() {
    return {
      paid_on: {
        type: String,
        validator: /^\d{4}-\d{2}-\d{2}$/,
        defaults_to: () => new Date().toISODate(),
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }

  /**
   * overrides the generic was of inserting entities into the DB
   *
   * @param {} arr
   * @param {*} param1
   * @returns
   */
  static async insert2(arr, { user, skip_cols = ["id", "status_id"] }) {
    // import_v3 inserts receipts in a generic manner
    if (user === undefined) return super.insert(arr, { user, skip_cols });

    const { items: req_its, paid_by, paid_on } = arr;

    const added_by = user.id;

    const idx_of_items_with_shares = req_its.reduce((arr, { shares }, idx) => {
      if (shares !== undefined) arr.push(idx);

      return arr;
    }, []);

    try {
      await begin();

      const [receipt] = await super.insert([
        {
          paid_by,
          paid_on,
        },
      ]);

      const items = await Item.insert(
        req_its.map(({ shares, ...item }) => ({
          ...item,
          rev_id,
          rcpt_id: receipt.id,
        }))
      );

      const item_shares = await ItemShare.insert(
        idx_of_items_with_shares.reduce((arr, idx) => {
          const item_id = items[idx].id;
          const shares = req_its[idx].shares;

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

      await commit();

      return { receipt, items, item_shares };
    } catch (err) {
      await rollback();
      throw new Error(`complex receipt insertion failed: ${err.message}`);
    }
  }
};
