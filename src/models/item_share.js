const Generic = require("./generic");

module.exports = class ItemShare extends Generic {
  static _tbl = "item_shares";

  static get _ids() {
    return {
      item_id: {
        type: Number,
        required: true,
        primary_key: true,
      },
      user_id: {
        type: Number,
        required: true,
        primary_key: true,
      },
      status_id: {
        type: Number,
        defaults_to: 0,
      },
      rev_id: {
        type: Number,
      },
    };
  }

  static get _validations() {
    return {
      share: {
        type: Number,
        required: true,
      },
    };
  }

  static async insert(arr, { skip_cols = ["status_id"], ...opts } = {}) {
    return this.in_batches(arr, { skip_cols, ...opts });
  }
};
