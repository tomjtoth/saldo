const Generic = require("./generic");
const { begin, commit, rollback } = require("../db");
const Item = require("./item");
const ItemShare = require("./item_share");

class Receipt extends GenericModel {
  static _tbl = "receipts";

  static get _validations() {
    return {
      added_on: {
        type: Number,
        validator: {
          test: (val) => new Date(val) <= new Date(),
          toString: () => "cannot be in the future",
        },
        defaults_to: () => new Date().epoch(),
      },
      added_by: {
        required: true,
        type: Number,
      },
      paid_on: {
        type: Number,
        validator: /^\d{5}$/,
        defaults_to: () => new Date().epoch_date(),
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }

  static async insert(arr, user) {
    // while import_v3 runs
    if (user === undefined) return super.insert(arr);

    const { items: req_its, paid_by, paid_on } = arr;

    const added_by = user.id;

    const idx_of_items_with_shares = req_its.reduce((arr, { shares }, idx) => {
      if (shares !== undefined) arr.push(idx);

      return arr;
    }, []);

    try {
      await begin();

      const [rcpt] = await super.insert([
        {
          paid_by,
          paid_on,
          added_by,
        },
      ]);

      const items = await Item.insert(
        req_its.map(({ shares, ...item }) => ({
          ...item,
          rcpt_id: rcpt.id,
        }))
      );

      const item_shares = await ItemShare.insert(
        idx_of_items_with_shares.reduce((arr, idx) => {
          const item_id = items[idx].id;
          const shares = req_its[idx].shares;

          arr.push(
            ...shares.reduce((arr, share, user_id) => {
              if (share !== null) arr.push({ share, user_id, item_id });

              return arr;
            }, [])
          );

          return arr;
        }, [])
      );

      await commit();

      return { rcpt, items, item_shares };
    } catch (err) {
      await rollback();
      throw new Error(`complex receipt insertion failed: ${err.message}`);
    }
  }
}

module.exports = Receipt;
