const router = require("express").Router({ mergeParams: true });
const svc = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(/\/(?<id>\d+)?/, ({ params: { tbl, id } }, res) => {
  svc
    .query(tbl, id ? { where: { id } } : null)
    .then((rows) => res.json(rows))
    .catch((err) => res.status(400).send(err));
});

router.post(
  "/",
  auth_checker,
  body_validator,
  ({ body, params: { tbl } }, res) => {
    svc
      .create(tbl, body)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(400).send(err));
  }
);

router.delete(
  /\/(?<id>\d+)?/,
  auth_checker,
  body_validator,
  ({ body, params: { tbl, id } }, res) => {
    svc
      .delete(tbl, id ? [{ tbl_id }] : body)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(400).send(err));
  }
);

router.put(
  "/",
  auth_checker,
  body_validator,
  ({ body, params: { tbl } }, res) => {
    svc
      .update(tbl, body)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(400).send(err));
  }
);

module.exports = router;
