const { ModelBackend } = require("../db");

class ValidationError extends Error {
  name = "model field validation";
}

const qt = (val) => JSON.stringify(val);

class GenericModel extends ModelBackend {
  // item_share overrides this
  static get _ids() {
    return {
      id: {
        type: Number,
      },
      status_id: {
        type: Number,
      },
    };
  }

  /**
   * SpecificModels override this
   */
  static get _validations() {
    return {};
  }

  static get _all_validations() {
    return { ...this._ids, ...this._validations };
  }

  diff(other) {
    return Object.keys(this).some((key) =>
      key === "id" ? false : this[key] !== other[key]
    );
  }

  constructor(raw_data) {
    super();
    const model = this.constructor.name;

    // necessary during update
    if (raw_data.id !== undefined) this.id = raw_data.id;

    // is the below actually necessary?
    if (raw_data.status_id !== undefined) this.status_id = raw_data.status_id;

    Object.entries(this.constructor._all_validations).forEach(
      ([field, { type, required, validator, def_val }]) => {
        const val = raw_data[field];

        if (val !== undefined) {
          if (type) {
            const model_type = type.name.toLowerCase();
            const val_type = typeof val;
            if (val && val_type !== model_type) {
              throw new ValidationError(
                `${model}.${field}=${qt(val)} is not of type ${model_type}`
              );
            }
          }

          if (validator && !validator.test(val)) {
            throw new ValidationError(
              `${model}.${field}=${qt(
                val
              )} did not satisfy ${validator.toString()}`
            );
          }

          this[field] = val;
        } else if (required) {
          throw new ValidationError(`field ${model}.${field} is missing`);
        } else if (def_val !== undefined) {
          this[field] = typeof def_val === "function" ? def_val() : def_val;
        }
      }
    );
  }
}

module.exports = GenericModel;
