const GenericModel = require("./generic");

class Revision extends GenericModel {
  get _ids() {
    return {
      id: {
        type: Number,
        required: true,
      },
    };
  }

  get _validations() {
    return {
      rev_on: {
        required: true,
        type: String,
      },
      rev_by: {
        required: true,
        type: Number,
      },
    };
  }
}

module.exports = Revision;
