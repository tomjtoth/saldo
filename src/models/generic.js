class ValidationError extends Error {
  name = "model field validation";
}

class GenericModel {
  // item_share overrides this
  get _ids() {
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
  get _validations() {
    return {};
  }

  get _all_validations() {
    return { ...this._ids, ...this._validations };
  }

  diff(other) {
    return Object.keys(this).some((key) =>
      key === "id" ? false : this[key] !== other[key]
    );
  }

  /**
   * called once before an update/insert statement
   * @param {*} opts
   * @returns `{columns, placeholders}`
   */
  cols_n_phs(opts = undefined) {
    let omit_id = false;

    if (opts && opts.omit_id !== undefined) omit_id = opts.omit_id;

    const columns = [],
      placeholders = [];

    for (const [field, validation] of Object.entries(this._all_validations)) {
      if (omit_id && field === "id") continue;

      const { write_to_db = true } = validation;

      if (write_to_db && this[field] !== undefined) {
        columns.push(field);
        placeholders.push("?");
      }
    }

    return { columns, placeholders: `(${placeholders.join(",")})` };
  }

  /**
   * called repeatedly for each entity during an insert/update statement
   * @param {*} columns
   * @returns
   */
  as_sql_params(columns) {
    return columns.map((field) => this[field]);
  }

  constructor(raw_data) {
    const model = this.constructor.name;

    // necessary during update
    if (raw_data.id !== undefined) this.id = raw_data.id;

    // is the below actually necessary?
    if (raw_data.status_id !== undefined) this.status_id = raw_data.status_id;

    Object.entries(this._all_validations).forEach(
      ([field, { type, required, pattern, def_val }]) => {
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
        } else if (def_val !== undefined) {
          this[field] = typeof def_val === "function" ? def_val() : def_val;
        }
      }
    );
  }
}

module.exports = GenericModel;
