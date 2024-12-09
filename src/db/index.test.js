const { reset_db, sql } = require(".");

test("resetting DB works", async () => {
  await reset_db();

  const [res] = await sql`select 
    count(idu.*) + count(idc.*) + count(idr.*) + count(idi.*) +
    count(s.*) + count(rev.*) + count(u.*) + count(c.*) +
    count(r.*) + count(i.*) + count(ish.*)
    as count
    from id.users idu, id.categories idc, id.receipts idr, id.items idi,
    statuses s, revisions rev, users u, categories c, receipts r, items i, 
    item_shares ish`;

  expect(res).toStrictEqual({ count: "0" });
});
