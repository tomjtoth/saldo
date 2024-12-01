const { MAX_POSITIONAL_PARAMS, sql } = require("../db");

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

  static cols({ skip_cols = [] } = {}) {
    return Object.keys(this._all_validations).filter(
      (col) => !skip_cols.includes(col)
    );
  }

  static async select(crit = {}) {
    const { params, where } = where_clause(crit);
    return from(
      await sql`select * from ${sql.unsafe(this._tbl)} ${sql.unsafe(where)}`
    );
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
        await sql`begin`;

        arr = this.from(
          arr,
          rev_by !== undefined
            ? // coming from a request
              {
                ...fields,
                rev_id: (
                  await sql`insert into revisions ${sql(
                    rev_by,
                    "rev_by"
                  )} returning id`
                )[0].id,
              }
            : //or import_v3
              {}
        );

        const columns = this.cols({ skip_cols });

        const max_rows_at_a_time = Math.floor(
          MAX_POSITIONAL_PARAMS / columns.length
        );

        const statements = [];

        for (let i = 0; i < arr.length; i += max_rows_at_a_time) {
          const part = arr.slice(i, i + max_rows_at_a_time);
          statements.push(
            await sql`insert into ${sql.unsafe(this._tbl)} ${sql(
              part,
              columns
            )} returning *`
          );
        }

        const results = this.from((await Promise.all(statements)).flat());

        await sql`commit`;
        resolve(results);
      } catch (err) {
        await sql`rollback`;
        reject(err.message);
      }
    });
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
