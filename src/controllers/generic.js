const router = require("express").Router({ mergeParams: true });
const { generic: svc } = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(/\/(?<id>\d+)?/, async ({ params: { tbl, id } }, res) => {
  res.send(await svc.query(tbl, { where: { id } }));
});

router.post(
  "/",
  auth_checker,
  body_validator,
  async ({ body, params: { tbl }, user }, res, next) => {
    if (tbl === "receipts") {
      if (body.paid_by === undefined) {
        return next({
          name: "missing payer",
          message: "who paid the bill?",
        });
      }
    }

    res.send(await svc.create(tbl, body, user));
  }
);

router.delete(
  /\/(?<id>\d+)?/,
  auth_checker,
  body_validator,
  async ({ body, params: { tbl, id }, user }, res, next) => {
    // allow deletion via path
    if (id !== undefined) body.entities.push({ id });

    if (body.entities.length == 0)
      return next({ name: "malformed body", message: "nothing to delete" });

    res.send(await svc.delete(tbl, body, user));
  }
);

router.put(
  /\/(?<id>\d+)?/,
  auth_checker,
  body_validator,
  async ({ body, params: { tbl }, user }, res, next) => {
    if (body.entities.length == 0)
      return next({ name: "malformed body", message: "nothing to update" });

    res.send(await svc.update(tbl, body, user));
  }
);

module.exports = router;
