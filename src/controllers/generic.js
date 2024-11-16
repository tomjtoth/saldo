const { hash } = require("bcrypt");

/**
 * column `id` is the primary key
 */
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
  async ({ body: { entities }, params: { tbl } }, res) => {
    if (tbl === "users") {
      const saltRounds = 10;
      entities = await Promise.all(
        entities.map(async (user) => {
          user.pw_hash = await hash(user.password, saltRounds);
          return user;
        })
      );
    }
    svc
      .create(tbl, entities)
      .then((rows) => res.json(rows))
      .catch((err) => res.status(400).send(err));
  }
);

router.delete(
  /\/(?<id>\d+)?/,
  auth_checker,
  body_validator,
  ({ body: { entities }, params: { tbl, id } }, res) => {
    // allow deletion via path
    if (id !== undefined) entities.push({ id });

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
