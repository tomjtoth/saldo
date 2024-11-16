const GenericModel = require("./generic");

class Item extends GenericModel {
  get _validations() {
    return {
      rcpt_id: {
        required: true,
        pattern: /\d+/,
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
      },
    };
  }
}

module.exports = Item;
