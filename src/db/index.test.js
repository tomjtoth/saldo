const { reset_db, sql } = require(".");

test("resetting DB works", async () => {
  await reset_db();

  const [{ count }] = await sql`select (
    (select count(*) from statuses) + 
    (select count(*) from revisions) + 
    (select count(*) from users) + 
    (select count(*) from categories) +
    (select count(*) from receipts) + 
    (select count(*) from items) + 
    (select count(*) from item_shares)
  )::int as count`;

  expect(count).toBe(2);
});
