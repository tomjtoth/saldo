const svc = require("../services");

module.exports = function (tbl) {
  const router = require("express").Router();

  router.get("/", (_req, res) => {
    svc
      .query(tbl)
      .then((rows) => res.json(rows))
      .catch((err) => res.send(err));
  });

  router.post("/", (req, res) => {
    svc
      .create(tbl, req.body)
      .then((rows) => res.json(rows))
      .catch((err) => res.send(err));
  });

  router.delete("/", (req, res) => {
    svc
      .delete(tbl, req.body)
      .then((rows) => res.json(rows))
      .catch((err) => res.send(err));
  });

  router.put("/", (req, res) => {
    svc
      .update(tbl, req.body)
      .then((rows) => res.json(rows))
      .catch((err) => res.send(err));
  });

  return router;
};
