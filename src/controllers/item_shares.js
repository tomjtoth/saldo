/**
 * `primary key(item_id, user_id)`
 */
const router = require("express").Router({ mergeParams: true });
const svc = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(
  /\/(?:(?<item_id>\d+)\/(?<user_id>\d+))?/,
  ({ params: { tbl, item_id, user_id } }, res) => {
    svc
      .query(tbl)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(400).send(err));
  }
);

router.post(
  "/",
  auth_checker,
  body_validator,
  ({ body: { entities }, params: { tbl } }, res) => {
    svc
      .create(tbl, entities)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(400).send(err));
  }
);

router.delete(
  /\/(?:(?<item_id>\d+)\/(?<user_id>\d+))?/,
  auth_checker,
  body_validator,
  ({ body: { entities }, params: { tbl, item_id, user_id } }, res) => {
    // allow deletion via path
    if (item_id !== undefined) entities.push({ item_id, user_id });

    if (entities.length > 0)
      svc
        .delete(tbl, entities)
        .then((rows) => res.json(rows))
        .catch((err) => res.status(400).send(err));
    else res.status(400).send("nothing to delete");
  }
);

router.put(
  "/",
  auth_checker,
  body_validator,
  ({ body: { entities }, params: { tbl } }, res) => {
    if (entities.length > 0)
      svc
        .update(tbl, entities)
        .then((rows) => res.json(rows))
        .catch((err) => res.status(400).send(err));
    else res.status(400).send("nothing to update");
  }
);

module.exports = router;
