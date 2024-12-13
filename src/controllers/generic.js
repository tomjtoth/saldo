const router = require("express").Router({ mergeParams: true });
const { generic: svc } = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(
  /\/(?:(?<id>\d+)(?:\/(?<id2>\d+))?)?/,
  async ({ params: { tbl, id, id2 } }, res) => {
    const crit = { where: {} };
    if (id !== undefined) {
      if (id2 === undefined) crit.where.id = id;
      else if (tbl === "item_shares") {
        crit.where.item_id = id;
        crit.where.user_id = id2;
      }
    }

    res.send(await svc.query(tbl, crit));
  }
);

router.post(
  "/",
  auth_checker,
  body_validator,
  async ({ body, params: { tbl }, user = {} }, res) => {
    if (tbl === "receipts") {
      if (body.paid_by === undefined) body.paid_by = user.id;
    }

    res.status(201).send(await svc.create(tbl, body, user.id));
  }
);

router.delete(
  /\/(?<id>\d+)/,
  auth_checker,
  body_validator,
  async ({ params: { tbl, id }, user }, res) => {
    res.status(201).send(await svc.delete(tbl, id, user.id));
  }
);

router.put(
  /\/(?<id>\d+)/,
  auth_checker,
  body_validator,
  async ({ body, params: { tbl, id }, user }, res) => {
    res.status(201).send(await svc.update(tbl, id, body, user.id));
  }
);

module.exports = router;
