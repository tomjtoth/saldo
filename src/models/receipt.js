const GenericModel = require("./generic");

class Receipt extends GenericModel {
  static _tbl = "receipts";

  static async TODO_insert(entities) {
    const { columns, placeholders } = entities[0]._cols_n_phs();
    const cols_str = `(${columns.join(",")})`;

    const max_rows_at_a_time = Math.floor(
      SQLITE_MAX_VARIABLE_NUMBER / columns.length
    );

    const statements = [];

    while (entities.length !== 0) {
      const splice = entities.splice(0, max_rows_at_a_time);
      statements.push(
        all(
          `insert into ${this._tbl} ${cols_str} values ${splice
            .map(() => placeholders)
            .join(",")} returning *`,
          splice.flatMap((e) => e._as_sql_params(columns))
        )
      );
    }

    return this.from((await Promise.all(statements)).flat());
  }

  static get _validations() {
    return {
      added_on: {
        type: String,
        validator: {
          test: (val) => new Date(val) <= new Date(),
          toString: () => "cannot be in the future",
        },
        def_val: () => new Date().toISOString(),
      },
      added_by: {
        required: true,
        type: Number,
      },
      paid_on: {
        def_val: () => new Date().toISOString().slice(0, 10),
        type: String,
        validator: /^\d{4}-\d{2}-\d{2}$/,
      },
      paid_by: {
        required: true,
        type: Number,
      },
    };
  }
}

module.exports = Receipt;
