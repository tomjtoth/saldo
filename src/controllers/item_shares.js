/**
 * `primary key(item_id, user_id)`
 */
const router = require("express").Router({ mergeParams: true });
const { item_shares: svc } = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(
  /\/(?:(?<item_id>\d+)\/(?<user_id>\d+))?/,
  async ({ params: { tbl, item_id, user_id } }, res) => {
    res.send(await svc.query(tbl));
  }
);

router.post(
  "/",
  auth_checker,
  body_validator,
  async ({ body: { entities }, params: { tbl } }, res) => {
    res.send(await svc.create(tbl, entities));
  }
);

router.delete(
  /\/(?:(?<item_id>\d+)\/(?<user_id>\d+))?/,
  auth_checker,
  body_validator,
  async (
    { body: { entities }, params: { tbl, item_id, user_id } },
    res,
    next
  ) => {
    // allow deletion via path
    if (item_id !== undefined) entities.push({ item_id, user_id });

    if (entities.length > 0) res.send(await svc.delete(tbl, entities));
    else return next({ name: "malformed body", message: "nothing to delete" });
  }
);

router.put(
  "/",
  auth_checker,
  body_validator,
  async ({ body: { entities }, params: { tbl } }, res, next) => {
    if (entities.length > 0) res.send(await svc.update(tbl, entities));
    else return next({ name: "malformed body", message: "nothing to update" });
  }
);

module.exports = router;
