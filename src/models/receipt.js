const GenericModel = require("./generic");

class Receipt extends GenericModel {
  get _validations() {
    return {
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