const { hash } = require("bcrypt");
const Generic = require("./generic");
const { sql } = require("../db");

const salt_rounds = 10;

module.exports = class User extends Generic {
  static _tbl = "users";

  static get _validations() {
    return {
      name: {
        type: String,
        required: true,
        validator: /\w{3,}/,
      },
      email: {
        type: String,
        required: true,
        validator: /[\w\.-]+@\w+\.[a-z]{2,}/,
      },
      passwd: {
        type: String,
        required: true,
        validator: /.{8,}/,
      },
    };
  }

  static async insert(arr) {
    return await sql.begin(async (sql) => {
      const emails = await this.select({
        what: "email",
        where: { email: arr.map((u) => u.email), status_id: 0 },
      });

      if (emails.length > 1)
        throw new Error(`emails ${emails.join(", ")} are already taken`);

      if (emails.length > 0)
        throw new Error(`email ${emails[0]} is already taken`);

      const [first] = await sql`select
        coalesce((select max(id) + 1 from ${sql.unsafe(
          this._tbl
        )}), 0)::int as mdl_id,
        coalesce((select max(id) + 1 from revisions), 0)::int as rev_id`;

      await sql`insert into id.${sql.unsafe(this._tbl)} ${sql(
        arr.map((_, i) => ({ id: first.mdl_id + i }))
      )}`;

      await sql`insert into revisions ${sql(
        arr.map((_, i) => ({
          id: first.rev_id + i,
          rev_by: first.mdl_id + i,
        }))
      )}`;

      arr = this.from(
        arr,
        (row, i) =>
          new this({
            ...row,
            id: first.mdl_id + i,
            rev_id: first.rev_id + i,
          })
      );

      await Promise.all(arr.map((u) => u.hash()));

      return this.from(
        await sql`insert into ${sql.unsafe(this._tbl)} ${sql(arr)} returning *`
      );
    });
  }

  async hash() {
    this.passwd = await hash(this.passwd, salt_rounds);
  }

  toJSON() {
    delete this.passwd;
    return this;
  }
};
