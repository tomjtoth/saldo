const GenericModel = require("./generic");

class Category extends GenericModel {
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
}

module.exports = Category;
