// TODO: use `in_chunks` in all 3 write ops
const { sql, where } = require("../db");

module.exports = class Backend {
  static get _all_validations() {
    return {};
  }

  static cols({ skip_cols = [] } = {}) {
    return Object.keys(this._all_validations).filter(
      (col) => !skip_cols.includes(col)
    );
  }

  static _cte(before = new Date()) {
    return sql`
    with cte_${sql.unsafe(this._tbl)} as (
      select mdl.*, rank() over (partition by mdl.id order by rev_on desc) as rnk
      from ${sql.unsafe(this._tbl)} mdl
      inner join revisions rev on rev.id = mdl.rev_id
      where rev.rev_on <= ${before}
    )`;
  }

  static async select(crit = {}) {
    return this.from(
      await sql`${this._cte()} select * from cte_${sql.unsafe(
        this._tbl
      )} where rnk = 1 ${where(crit)}`
    );
  }

  static async insert(arr, { needs_rev = false, rev_by }) {
    return await sql.begin(async (sql) => {
      const [{ first_id, rev_id }] = await sql`select
        coalesce((select max(id) + 1 from ${sql.unsafe(
          this._tbl
        )}), 0)::int as first_id,
        coalesce((select max(id) + 1 from revisions), 0)::int as rev_id`;

      arr = this.from(
        arr,
        (row, i) =>
          new this({
            ...row,
            id: first_id + i,
            // rev_id will be discarded when parsing models w/o it
            rev_id,
          })
      );

      if (needs_rev) {
        await sql`insert into id.${sql.unsafe(this._tbl)} ${sql(arr, ["id"])}`;

        await sql`insert into revisions ${sql({
          id: rev_id,
          rev_by,
        })}`;
      }

      return this.from(
        await sql`insert into ${sql.unsafe(this._tbl)} ${sql(arr)} returning *`
      );
    });
  }

  static async update(arr, { rev_by, ...overrides }) {
    return await sql.begin(async (sql) => {
      const [{ rev_id }] =
        await sql`select coalesce(max(id) + 1, 0)::int as rev_id from revisions`;

      arr = this.from(arr, { ...overrides, rev_id });

      await sql`insert into revisions ${sql({
        id: rev_id,
        rev_by,
      })}`;

      return this.from(
        await sql`insert into ${sql.unsafe(this._tbl)} ${sql(arr)} returning *`
      );
    });
  }

  static delete(arr, { rev_by }) {
    return this.update(arr, { rev_by, status_id: 1 });
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
