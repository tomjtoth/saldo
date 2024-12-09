// TODO: use `in_chunks` in all 3 write ops
const { sql, where, what } = require("../db");

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
    return this.from(
      await sql`select ${what(crit)} from ${sql.unsafe(this._tbl)} ${where(
        crit
      )}`
    );
  }

  static async insert(arr, { needs_rev = false, rev_by }) {
    return await sql.begin(async (sql) => {
      const [first] = await sql`select
        coalesce((select max(id) + 1 from ${sql.unsafe(
          this._tbl
        )}), 0)::int as mdl_id,
        coalesce((select max(id) + 1 from revisions), 0)::int as rev_id`;

      arr = this.from(
        arr,
        (row, i) =>
          new this({
            ...row,
            id: first.mdl_id + i,
            rev_id: first.rev_id,
          })
      );

      if (needs_rev) {
        await sql`insert into id.${sql.unsafe(this._tbl)} ${sql(arr, ["id"])}`;

        await sql`insert into revisions ${sql({
          id: first.rev_id,
          rev_by,
        })}`;
      }

      return this.from(
        await sql`insert into ${sql.unsafe(this._tbl)} ${sql(arr)} returning *`
      );
    });
  }

  static async delete(arr, { rev_by }) {
    return this.from(
      await sql`insert into ${sql.unsafe(this._tbl)} ${sql(
        this.from(arr, { status_id: 1, rev_by })
      )} returning *`
    );
  }

  static async update(arr, { rev_by }) {
    return this.from(
      await sql`insert into ${sql.unsafe(this._tbl)} ${sql(
        this.from(arr, { rev_by })
      )} returning *`
    );
  }

  /**
   * turns an array of objects into known Models while applying possible overrides
   * effectively enforcing Model validation in batches
   * @param {*} arr
   * @param {*} overrides
   * @returns
   */
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
