const { promisify } = require("util");
const db = require("../db");
const { curr_uid } = require("./login");
const models = require("../models");

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

module.exports = {
  query: function (tbl, opts = null) {
    let sql = `select * from ${tbl} where status_id != -1`;

    if (opts) {
      sql += ` `;
    }

    return all(sql).then((rows) => rows.map((r) => new models[tbl](r)));
  },

  create: function (tbl, entities) {
    const { columns, placeholders } = entities[0].cols_n_phs();

    // TODO: protect against that 32766 limit and merge insert_in_batches somehow
    const sql = `insert into ${tbl} (${columns.join(",")}) values ${entities
      .map(() => placeholders)
      .join(",")} returning *`;

    return all(
      sql,
      entities.flatMap((e) => e.as_sql_params(columns))
    ).then((rows) => rows.map((r) => new models[tbl](r)));
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
        ).then((rows) => rows.map((r) => new models[tbl](r)));

        await run("COMMIT");

        resolve(updated_entities);
      } catch (error) {
        await run("ROLLBACK");
        reject(`Transaction failed: ${error.message}`);
      }
    });
  },

  update: function (tbl, entities) {
    const ids = entities.map((x) => x.id).join(",");
    const { columns } = entities[0].cols_n_phs({
      omit_id: true,
    });
    const params_as_arr = entities.map((e) => e.as_sql_params(columns));

    return new Promise(async (resolve, reject) => {
      try {
        await run("BEGIN");

        await run(`INSERT INTO revisions (rev_by) SELECT ${curr_uid()}`);

        await run(`INSERT INTO ${tbl}_history
                  SELECT *, last_insert_rowid()
                  FROM ${tbl} WHERE id IN (${ids})`);

        /**
         * starting a new TAC for each row to be updated,
         * then continuing when *all* of them returned
         */
        const updated_entities = await Promise.all(
          entities.map(
            async ({ id }, ent_idx_in_arr) =>
              await get(
                // building `KEY = ?` for each col to be updated
                `UPDATE ${tbl} 
                SET ${columns.map((col) => `${col} = ?`).join(",")} 
                WHERE id = ${id} RETURNING *`,
                params_as_arr[ent_idx_in_arr]
              ).then((row) => new models[tbl](row))
          )
        );

        await run("COMMIT");

        resolve(updated_entities);
      } catch (error) {
        // this will remove the rev_id from revisions
        await run("ROLLBACK");
        reject(`Transaction failed: ${error.message}`);
      }
    });
  },
};
