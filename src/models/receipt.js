const GenericModel = require("./generic");

class Receipt extends GenericModel {
  get _validations() {
    return {
      added_on: {
        type: String,
        def_val: () => new Date().toISOString(),
      },
      added_by: {
        required: true,
        type: Number,
      },
      paid_on: {
        required: true,
        type: String,
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }
}

module.exports = Receipt;
