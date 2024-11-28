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
  // TODO: simpler destructuring?
  static _cols_n_phs(opts = {}) {
    const { omit = [] } = opts;

    const [columns, placeholders] = Object.keys(this._all_validations).reduce(
      ([cols, phs], field) => {
        if (!omit.includes(field)) {
          cols.push(field);
          phs.push("?");
        }
        return [cols, phs];
      },
      [[], []]
    );

    return { columns, placeholders: `(${placeholders.join(",")})` };
  }

  _as_sql_params(columns) {
    return columns.map((field) => this[field]);
  }

  static async select(crit = {}) {
    const { params, where } = where_clause(crit);
    const sql = `select * from ${this._tbl} ${where}`;

    return this.from(await all(sql, ...params));
  }

  static async insert(arr) {
    if (arr[0].constructor !== this) arr = this.from(arr);

    const { columns, placeholders } = this._cols_n_phs();
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
          part.flatMap((e) => e._as_sql_params(columns))
        )
      );
    }

    return this.from((await Promise.all(statements)).flat());
  }

  async save() {
    const model = this.constructor;
    return (
      this.id === undefined
        ? await model.insert([this])
        : await model.update([this])
    )[0];
  }

  static async delete(arr, user) {
    const ids = arr.map((x) => x.id).join(",");

    return this.from(
      await new Promise(async (resolve, reject) => {
        try {
          await begin();

          await run(`INSERT INTO revisions (rev_by) SELECT ${user.id}`);

          await run(`
              INSERT INTO ${this._tbl}_history
              SELECT *, last_insert_rowid()
              FROM ${this._tbl} WHERE id IN (${ids})
            `);

          const updated_entities = await all(
            `UPDATE ${this._tbl} SET status_id = 1 WHERE id IN (${ids}) RETURNING *`
          );

          await commit();

          resolve(updated_entities);
        } catch (err) {
          await rollback();
          reject(`Transaction failed: ${err.message}`);
        }
      })
    );
  }

  async delete() {
    const model = this.constructor;
    return (await model.delete([this]))[0];
  }

  static async update(arr, user) {
    if (arr[0].constructor !== this) arr = this.from(arr);

    const ids = arr.map((x) => x.id).join(",");
    const { columns } = this._cols_n_phs({
      omit: ["id"],
    });
    const params_as_arr = arr.map((e) => e._as_sql_params(columns));

    return this.from(
      await new Promise(async (resolve, reject) => {
        try {
          await begin();

          await run(`INSERT INTO revisions (rev_by) SELECT ${user.id}`);

          await run(`INSERT INTO ${this._tbl}_history
                        SELECT *, last_insert_rowid()
                        FROM ${this._tbl} WHERE id IN (${ids})`);

          /**
           * starting a new TAC for each row to be updated,
           * then continuing when *all* of them returned
           */
          const updated_entities = await Promise.all(
            arr.map(
              async ({ id }, ent_idx_in_arr) =>
                await get(
                  // building `KEY = ?` for each col to be updated
                  `UPDATE ${this._tbl} 
                      SET ${columns.map((col) => `${col} = ?`).join(",")} 
                      WHERE id = ${id} RETURNING *`,
                  params_as_arr[ent_idx_in_arr]
                )
            )
          );

          await commit();

          resolve(updated_entities);
        } catch (err) {
          // this will remove the rev_id from revisions
          await rollback();
          reject(`Transaction failed: ${err.message}`);
        }
      })
    );
  }

  static from(arr) {
    return arr.map((r) => new this(r));
  }
};
