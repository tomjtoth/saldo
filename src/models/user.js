const GenericModel = require("./generic");

class User extends GenericModel {
  get _validations() {
    return {
      name: {
        type: String,
        required: true,
        pattern: /\w{3,}/,
      },
      email: {
        type: String,
        required: true,
        pattern: /[\w\.-]+@\w+\.[a-z]{2,}/,
      },
      passwd: {
        type: String,
        pattern: /.{8,}/,
      },
    };
  }

  toJSON() {
    delete this.passwd;
    return this;
  }
}

module.exports = User;
