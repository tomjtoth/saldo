const Validator = require("./generic");

class User extends Validator {
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
    };
  }

  toJSON() {
    const { pw_hash, ...rest } = this;
    return rest;
  }
}

module.exports = User;
