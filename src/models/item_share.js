const Validator = require("./generic");

class ItemShare extends Validator {
  get _validations() {
    return {
      item_id: {
        type: Number,
        required: true,
      },
      user_id: {
        type: Number,
        required: true,
      },
      share: {
        type: Number,
        required: true,
      },
    };
  }
}

module.exports = ItemShare;
