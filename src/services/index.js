const db = require("../db");
const { curr_uid } = require("./login");
const process_entities = require("../utils/process_entities");
const { promisify } = require("util");
const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

module.exports = {
  query: function (tbl, opts) {
    let sql = `select * from ${tbl} where status_id != -1`;

    if (opts) {
      sql += ` `;
    }

    return all(sql);
  },

  create: function (tbl, entities) {
    const { cols, placeholders, params_as_arr } = process_entities(entities);

    // TODO: protect against that 32766 limit and merge insert_in_batches somehow
    const sql = `insert into ${tbl} (${cols.join(",")}) values ${params_as_arr
      .map(() => placeholders)
      .join(",")} returning *`;

    return all(sql, ...params_as_arr.flat());
  },

  /**
   * ids can be safely injected below
   * as they were validated via either the body_validator middleware
   * or the path regex of the router
   */
  delete: function (tbl, entities) {
    const ids = entities.map((x) => x.id).join(",");

    return new Promise(async (resolve, reject) => {
      try {
        await run("BEGIN");

        await run(`INSERT INTO revisions (rev_by) SELECT ${curr_uid()}`);

        await run(`
          INSERT INTO ${tbl}_history
          SELECT *, last_insert_rowid()
          FROM ${tbl} WHERE id IN (${ids})
        `);

        const updated_entities = await all(
          `UPDATE ${tbl} SET status_id = -1 WHERE id IN (${ids}) RETURNING *`
        );

        await run("COMMIT");

        resolve(updated_entities);
      } catch (error) {
        await run("ROLLBACK");
        reject("Transaction failed:", error.stack);
      }
    });
  },

  update: function (tbl, entities) {
    const ids = entities.map((x) => x.id).join(",");
    const { cols, params_as_arr } = process_entities(entities, {
      omit_id: true,
    });

    return new Promise(async (resolve, reject) => {
      try {
        await run("BEGIN");

        await run(`INSERT INTO revisions (rev_by) SELECT ${curr_uid()}`);

        await run(`INSERT INTO ${tbl}_history
                  SELECT *, last_insert_rowid()
                  FROM ${tbl} WHERE id IN (${ids})`);

        const updated_entities = await Promise.all(
          entities.map(
            async ({ id }, ent_idx_in_arr) =>
              await get(
                `UPDATE ${tbl} 
                SET ${cols.map((col) => `${col} = ?`).join(",")} 
                WHERE id = ${id} RETURNING *`,
                params_as_arr[ent_idx_in_arr]
              )
          )
        );

        await run("COMMIT");

        resolve(updated_entities);
      } catch (error) {
        await run("ROLLBACK");
        reject("Transaction failed:", error.stack);
      }
    });
  },
};
