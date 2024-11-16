const GenericModel = require("./generic");

class ItemShare extends GenericModel {
  get _ids() {
    return {
      item_id: {
        type: Number,
        required: true,
      },
      user_id: {
        type: Number,
        required: true,
      },
    };
  }

  get _validations() {
    return {
      share: {
        type: Number,
        required: true,
      },
    };
  }
}

module.exports = ItemShare;
