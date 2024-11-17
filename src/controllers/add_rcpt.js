const router = require("express").Router({ mergeParams: true });
const { generic: svc } = require("../services");
const { auth_checker } = require("../utils/middleware");
const {
  receipts: Receipt,
  items: Item,
  item_shares: ItemShare,
} = require("../models");

router.get("/", (_req, res) => {
  res.status(400).send("WiP");
});

router.post(
  "/",
  auth_checker,
  async ({ body: { paid_on, paid_by, entities }, user }, res) => {
    return res.status(400).send("WiP");

    const [{ id: rcpt_id }] = await svc.create("receipts", [
      new Receipt({
        paid_on,
        paid_by,
        added_by: user.id,
      }),
    ]);

    const items = [],
      item_shares = [];

    entities.forEach(({ shares, ...item }, id) => {
      items.push(new Item({ rcpt_id, ...item }));
      // sync item_shares, etc
    });
  }
);

module.exports = router;
