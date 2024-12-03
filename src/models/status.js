const Generic = require("./generic");

module.exports = class Status extends Generic {
  static _tbl = "statuses";

  static get _ids() {
    return {
      id: {
        type: Number,
      },
    };
  }

  static get _validations() {
    return {
      status: {
        type: String,
        required: true,
      },
    };
  }
};
