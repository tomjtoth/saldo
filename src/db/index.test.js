const { reset_db, qry_mstr } = require(".");

test("resetting DB works", async () => {
  await reset_db();
  expect(await qry_mstr("table")).toHaveLength(8);
  expect(await qry_mstr("view")).toHaveLength(3);
});
