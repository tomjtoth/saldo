const Generic = require("./generic");

module.exports = class Item extends Generic {
  static _tbl = "items";

  static get _validations() {
    return {
      rcpt_id: {
        required: true,
        type: Number,
      },
      cat_id: {
        required: true,
        type: Number,
      },
      cost: {
        required: true,
        type: Number,
        validator: /^-?\d+$/,
      },
      notes: {
        type: String,
        defaults_to: null,
      },
    };
  }

  static insert(arr, opts) {
    return super.insert(arr, { ...opts, needs_rev: true });
  }
};
