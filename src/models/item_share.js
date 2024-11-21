const GenericModel = require("./generic");

class ItemShare extends GenericModel {
  static _tbl = "item_shares";

  static get _ids() {
    return {
      item_id: {
        type: Number,
        required: true,
      },
      user_id: {
        type: Number,
        required: true,
      },
      status_id: {
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
}

module.exports = ItemShare;
