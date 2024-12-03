// TODO: use `in_chunks` in all 3 write ops
const { sql } = require("../db");

// TODO: see if postgres has something better, than this SQLite related func
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

  static async select() {
    return from(await sql`select * from ${sql.unsafe(this._tbl)}`);
  }

  static async insert(arr, { update_ids = true } = {}) {
    return await sql.begin(async (sql) => {
      const first_id =
        (await sql`select max(id) from ${sql.unsafe(this._tbl)}`)[0].id + 1;

      arr = this.from(arr, (row, i) => new this({ ...row, id: first_id + i }));

      if (update_ids)
        await sql`insert into id.${sql.unsafe(this._tbl)} ${sql(arr, ["id"])}`;

      return await sql`insert into ${sql.unsafe(this._tbl)} ${sql(arr)}`;
    });
  }

  static async delete(arr) {
    return this.from(
      await sql`insert into ${sql.unsafe(this._tbl)} ${sql(
        this.from(arr, { status_id: 1 })
      )} returning *`
    );
  }

  static async update(arr) {
    return this.from(
      await sql`insert into ${sql.unsafe(this._tbl)} ${sql(
        this.from(arr)
      )} returning *`
    );
  }

  static from(arr, overrides = {}) {
    return arr.map(
      typeof overrides === "function"
        ? overrides
        : (row) => new this({ ...row, ...overrides })
    );
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
