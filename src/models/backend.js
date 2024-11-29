const {
  SQLITE_MAX_VARIABLE_NUMBER,
  begin,
  commit,
  rollback,
  run,
  all,
  get,
} = require("../db");

const where_clause = ({ where }) => {
  const params = [];
  const sql = Object.keys(where)
    .reduce((arr, key) => {
      const val = where[key];

      if (Array.isArray(val)) {
        params.push(...val);
        arr.push(`${key} in (${val.map((x) => "?").join(",")})`);
      } else {
        params.push(val);
        arr.push(`${key} = ?`);
      }

      return arr;
    }, [])
    .join(" and ");

  return { where: sql.length > 0 ? `where ${sql}` : "", params };
};

module.exports = class Backend {
  static get _all_validations() {
    return {};
  }

  /**
   * columns and placeholders
   * @param {*} opts
   * @returns
   */
  static _columns({ skip_cols = [] } = {}) {
    const placeholders = [];
    const columns = Object.keys(this._all_validations).filter((col) => {
      if (!skip_cols.includes(col)) {
        placeholders.push("?");
        return true;
      }
    });

    return { columns, placeholders: `(${placeholders.join(",")})` };
  }

  static async select(crit = {}) {
    const { params, where } = where_clause(crit);
    const sql = `select * from ${this._tbl} ${where}`;

    return this.from(await all(sql, ...params));
  }

  static async insert(arr, { skip_cols = ["id", "status_id"], ...opts } = {}) {
    return this.in_batches(arr, { skip_cols, ...opts });
  }

  static async delete(arr, opts = {}) {
    return this.in_batches(arr, { status_id: 1, ...opts });
  }

  static async update(arr, opts = {}) {
    return this.in_batches(arr, opts);
  }

  static from(arr, overrides = {}) {
    return arr.map((row) => new this({ ...row, ...overrides }));
  }

  static async in_batches(arr, { rev_by, skip_cols, ...fields }) {
    return new Promise(async (resolve, reject) => {
      try {
        await begin();

        arr = this.from(
          arr,
          rev_by !== undefined
            ? // coming from a request
              {
                ...fields,
                rev_id: (
                  await get(
                    "insert into revisions (rev_by) values (?) returning id",
                    [rev_by]
                  )
                ).id,
              }
            : //or import_v3
              {}
        );

        const { columns, placeholders } = this._columns({ skip_cols });
        const cols_str = `(${columns.join(",")})`;

        const max_rows_at_a_time = Math.floor(
          SQLITE_MAX_VARIABLE_NUMBER / columns.length
        );

        const statements = [];

        for (let i = 0; i < arr.length; i += max_rows_at_a_time) {
          const part = arr.slice(i, i + max_rows_at_a_time);
          statements.push(
            all(
              `insert into ${this._tbl} ${cols_str} values ${part
                .map(() => placeholders)
                .join(",")} returning *`,
              part.flatMap((x) => x._as_sql_params(columns))
            )
          );
        }

        const results = this.from((await Promise.all(statements)).flat());

        await commit();
        resolve(results);
      } catch (err) {
        await rollback();
        reject(err.message);
      }
    });
  }

  _as_sql_params(columns) {
    return columns.map((col) => this[col]);
  }

  async save() {
    const model = this.constructor;
    return (
      this.id === undefined
        ? await model.insert([this])
        : await model.update([this])
    )[0];
  }

  async delete() {
    const model = this.constructor;
    return (await model.delete([this]))[0];
  }
};
