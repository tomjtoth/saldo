const { hash } = require("bcrypt");
const Generic = require("./generic");

const salt_rounds = 10;

module.exports = class User extends Generic {
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
};
