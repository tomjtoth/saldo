const ModelBackend = require("./backend");

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
        defaults_to: 0,
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

    Object.entries(this.constructor._all_validations).forEach(
      ([field, { type, required = false, validator, defaults_to }]) => {
        const value = raw_data[field];

        if (value === undefined) {
          if (required) {
            throw new ValidationError(`field ${model}.${field} is missing`);
          } else if (defaults_to !== undefined) {
            this[field] =
              typeof defaults_to === "function" ? defaults_to() : defaults_to;
          }
          // else if (!primary_key) this[field] = null;
        } else {
          if (type) {
            const model_type = type.name.toLowerCase();
            const value_type = typeof value;
            if (value && value_type !== model_type) {
              throw new ValidationError(
                `${model}.${field}=${qt(value)} is not of type ${model_type}`
              );
            }
          }

          if (validator && !validator.test(value)) {
            throw new ValidationError(
              `${model}.${field}=${qt(
                value
              )} did not satisfy ${validator.toString()}`
            );
          }

          this[field] = value;
        }
      }
    );
  }
};
