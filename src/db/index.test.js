const { reset_db, sql } = require(".");

test("resetting DB works", async () => {
  await reset_db();
  expect(await sql`select * from item_shares`).toHaveLength(0);
});
