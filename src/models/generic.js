class ValidationError extends Error {}

class Validator {
  get _validations() {
    return {};
  }

  constructor(raw_data) {
    const model = this.constructor.name;

    // necessary during update
    if (raw_data.id !== undefined) this.id = raw_data.id;

    // is the below actually necessary?
    if (raw_data.status_id !== undefined) this.status_id = raw_data.status_id;

    Object.entries(this._validations).forEach(
      ([field, { type, required, pattern }]) => {
        const val = raw_data[field];

        if (val !== undefined) {
          if (type) {
            const model_type = type.name.toLowerCase();
            const val_type = typeof val;
            if (val && val_type !== model_type) {
              throw new ValidationError(
                `${model}.${field}=${val} is not of type ${model_type}`
              );
            }
          }

          if (pattern && !pattern.test(val)) {
            throw new ValidationError(
              `${model}.${field}="${val}" did not satisfy ${pattern.toString()}`
            );
          }

          this[field] = val;
        } else if (required) {
          throw new ValidationError(`field ${model}.${field} is missing`);
        }
      }
    );
  }
}

module.exports = Validator;
