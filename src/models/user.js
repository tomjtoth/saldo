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
        pattern: /\w+@\w+\.[a-z]{2,}/,
      },
      password: {
        type: String,
        pattern: /.{8,}/,
        write_to_db: false,
      },
      pw_hash: {
        type: String,
      },
    };
  }

  toJSON() {
    delete this.pw_hash;
    return this;
  }
}

module.exports = User;
