const GenericModel = require("./generic");

class Category extends GenericModel {
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
