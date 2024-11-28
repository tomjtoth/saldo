const { hash } = require("bcrypt");
const GenericModel = require("./generic");

const salt_rounds = 10;

class User extends GenericModel {
  static _tbl = "users";

  static get _validations() {
    return {
      name: {
        type: String,
        required: true,
        validator: /\w{3,}/,
      },
      email: {
        type: String,
        required: true,
        validator: /[\w\.-]+@\w+\.[a-z]{2,}/,
      },
      passwd: {
        type: String,
        required: true,
validator: /.{8,}/,
      },
    };
  }

  async hash() {
    this.passwd = await hash(this.passwd, salt_rounds);
  }

  toJSON() {
    delete this.passwd;
    return this;
  }
}

module.exports = User;
