const GenericModel = require("./generic");
const { get, begin, commit, rollback } = require("../db");
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
        def_val: () => new Date().epoch(),
      },
      added_by: {
        required: true,
        type: Number,
      },
      paid_on: {
        type: Number,
        validator: /^\d{5}$/,
        def_val: () => new Date().epoch_date(),
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }

  static async insert({ entities, paid_by, paid_on }, user) {
    if (user === undefined) return super.insert({ entities });

    const added_by = user.id;

    const idx_of_items_with_shares = entities.reduce((arr, { shares }, idx) => {
      if (shares !== undefined) arr.push(idx);

      return arr;
    }, []);

    try {
      await begin();

      const rcpt = new this(
        await get(
          `insert into receipts(paid_by, paid_on, added_by) values (?,?,?) returning *`,
          [paid_by, paid_on, added_by]
        )
      );

      const items = await Item.insert({
        // validating user input via `Model.from()`
        entities: Item.from(
          // trimming shares from each row
          entities.map(({ shares, ...item }) => ({
            ...item,
            rcpt_id: rcpt.id,
          }))
        ),
      });

      const item_shares = await ItemShare.insert({
        entities:
          // validating user input via `Model.from()`
          ItemShare.from(
            idx_of_items_with_shares.reduce((arr, idx) => {
              const item_id = items[idx].id;
              const shares = entities[idx].shares;

              arr.push(
                ...shares.reduce((arr, share, user_id) => {
                  if (share !== null) arr.push({ share, user_id, item_id });

                  return arr;
                }, [])
              );

              return arr;
            }, [])
          ),
      });

      await commit();

      return { rcpt, items, item_shares };
    } catch (err) {
      await rollback();
      throw new Error(`complex receipt insertion failed: ${err.message}`);
    }
  }
}

module.exports = Receipt;
