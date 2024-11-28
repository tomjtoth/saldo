const GenericModel = require("./generic");

class Item extends GenericModel {
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
      },
      notes: {
        type: String,
        defaults_to: null,
      },
    };
  }
}

module.exports = Item;
