const Generic = require("./generic");

module.exports = class Revision extends Generic {
  static _tbl = "revisions";

  static get _ids() {
    return {
      id: {
        type: Number,
      },
    };
  }

  static get _validations() {
    return {
      rev_on: {
        required: true,
        type: Number,
      },
      rev_by: {
        required: true,
        type: Number,
      },
    };
  }
};
