const Validator = require("./generic");

class Category extends Validator {
  get _validations() {
    return {
      category: {
        type: String,
        required: true,
        pattern: /\w{3,}/,
      },
    };
  }
}

module.exports = Category;
