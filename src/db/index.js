const { promisify } = require("util");
const sqlite3 = require("sqlite3").verbose();
const { DB_PATH, NODE_ENV } = require("../utils/config");

const db = new sqlite3.Database(NODE_ENV === "test" ? ":memory:" : DB_PATH);

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

const begin = () => run("begin");
const commit = () => run("commit");
const rollback = () => run("rollback");

/**
 * the maximum value of a host parameter number is
 * SQLITE_MAX_VARIABLE_NUMBER, which defaults to
 * 32766 for SQLite versions after 3.32.0.
 */
const SQLITE_MAX_VARIABLE_NUMBER = 32766;

const where_clause = (crit = {}) => {
  const { where } = crit;
  const params = [];
  const sql = Object.keys(where)
    .filter((k) => where[k] !== undefined)
    .map((key) => {
      const val = where[key];
      if (Array.isArray(val)) {
        params.push(...val);
        return `${key} in (${val.map((x) => "?").join(",")})`;
      } else {
        params.push(val);
        return `${key} = ?`;
      }
    })
    .join(" and ");

  return { where: sql.length > 0 ? `where ${sql}` : "", params };
};

class ModelBackend {
  static get _all_validations() {
    return {};
  }

  /**
   * columns and placeholders
   * @param {*} opts
   * @returns
   */
  _cols_n_phs(opts = {}) {
    const { omit_id = false } = opts;

    const columns = [],
      placeholders = [];

    for (const [field, validation] of Object.entries(
      this.constructor._all_validations
    )) {
      if (omit_id && field === "id") continue;

      const { write_to_db = true } = validation;

      if (write_to_db && this[field] !== undefined) {
        columns.push(field);
        placeholders.push("?");
      }
    }

    return { columns, placeholders: `(${placeholders.join(",")})` };
  }

  _as_sql_params(columns) {
    return columns.map(
      (field) =>
        // TODO must be verified here
        this[field] //=== undefined ? null : this[field]
    );
  }

  static async select(crit = {}) {
    const { params, where } = where_clause(crit);
    const sql = `select * from ${this._tbl} ${where}`;

    return this.from(await all(sql, ...params));
  }

  static async insert({ entities }) {
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

  save() {
    const model = this.constructor;
    return (
      this.id === undefined ? model.insert([this]) : model.update([this])
    )[0];
  }

  static async delete({ entities }, user) {
    const ids = entities.map((x) => x.id).join(",");

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
            `UPDATE ${this._tbl} SET status_id = -1 WHERE id IN (${ids}) RETURNING *`
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

  delete() {
    const model = this.constructor;
    return model.delete([this])[0];
  }

  static async update({ entities }, user) {
    const ids = entities.map((x) => x.id).join(",");
    const { columns } = entities[0]._cols_n_phs({
      omit_id: true,
    });
    const params_as_arr = entities.map((e) => e._as_sql_params(columns));

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
            entities.map(
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

  static from(entities) {
    return entities.map((r) => new this(r));
  }
}

module.exports = {
  db,
  get,
  all,
  begin,
  commit,
  rollback,
  ModelBackend,
};
