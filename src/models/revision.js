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
        type: String,
        validator: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      },
      rev_by: {
        required: true,
        type: Number,
      },
    };
  }

  static insert = this.simpler_insert;
};
