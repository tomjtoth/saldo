const Item = require("./item");

test("field validations work", () => {
  const item = new Item({ cost: 1, rcpt_id: 1, cat_id: 1 });
  expect(item.id).toBeUndefined();
  expect(item.notes).toBeNull();
  expect(item.status_id).toBe(0);
});
