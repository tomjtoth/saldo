const GenericModel = require("./generic");
const { get, begin, commit, rollback } = require("../db");
const Item = require("./item");
const ItemShare = require("./item_share");

class Receipt extends GenericModel {
  static _tbl = "receipts";

  static get _validations() {
    return {
      added_on: {
        type: String,
        validator: {
          test: (val) => new Date(val) <= new Date(),
          toString: () => "cannot be in the future",
        },
        def_val: () => new Date().toISOString(),
      },
      added_by: {
        required: true,
        type: Number,
      },
      paid_on: {
        def_val: () => new Date().toISOString().slice(0, 10),
        type: String,
        validator: /^\d{4}-\d{2}-\d{2}$/,
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }

  static async insert({ entities, paid_by, paid_on }, { id: added_by }) {
    const idx_of_items_with_shares = entities
      .map(({ shares }, idx) => [shares !== undefined, idx])
      .filter(([has_shares]) => has_shares);

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
            idx_of_items_with_shares.flatMap(([_has_shares, idx]) => {
              const item_id = items[idx].id;
              const shares = entities[idx].shares;

              return shares
                .map((share, user_id) => ({ share, user_id, item_id }))
                .filter(({ share }) => share !== null);
            })
          ),
      });

      commit();

      return { rcpt, items, item_shares };
    } catch (err) {
      rollback();
      throw new Error(`complex receipt insertion failed: ${err.message}`);
    }
  }
}

module.exports = Receipt;
