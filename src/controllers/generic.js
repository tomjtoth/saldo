const { hash } = require("bcrypt");

/**
 * column `id` is the primary key
 */
const router = require("express").Router({ mergeParams: true });
const svc = require("../services");
const { auth_checker, body_validator } = require("../utils/middleware");

router.get(/\/(?<id>\d+)?/, async ({ params: { tbl, id } }, res) => {
  res.send(await svc.query(tbl, id ? { where: "id = ?", params: [id] } : null));
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

    res.send(await svc.create(tbl, entities));
  }
);

router.delete(
  /\/(?<id>\d+)?/,
  auth_checker,
  body_validator,
  async ({ body: { entities }, params: { tbl, id } }, res, next) => {
    // allow deletion via path
    if (id !== undefined) entities.push({ id });

    if (entities.length > 0) res.send(await svc.delete(tbl, entities));
    else next({ name: "malformed body", message: "nothing to delete" });
  }
);

router.put(
  "/",
  auth_checker,
  body_validator,
  async ({ body: { entities }, params: { tbl } }, res, next) => {
    if (entities.length > 0) res.send(await svc.update(tbl, entities));
    else next({ name: "malformed body", message: "nothing to update" });
  }
);

module.exports = router;
