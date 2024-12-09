const Generic = require("./generic");

module.exports = class Category extends Generic {
  static _tbl = "categories";

  static get _validations() {
    return {
      category: {
        type: String,
        required: true,
        validator: /\w{3,}/,
      },
    };
  }

  static insert(arr, opts) {
    return super.insert(arr, { ...opts, needs_rev: true });
  }
};
