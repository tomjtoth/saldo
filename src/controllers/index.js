const router = require("express").Router({ mergeParams: true });
const svc = require("../services");

router.get("/", (req, res) => {
  svc
    .query(req.params.tbl, req.body)
    .then((rows) => res.json(rows))
    .catch((err) => res.status(400).send(err));
});

router.post("/", (req, res) => {
  svc
    .create(req.params.tbl, req.body)
    .then((rows) => res.json(rows))
    .catch((err) => res.status(400).send(err));
});

router.delete("/", (req, res) => {
  svc
    .delete(req.params.tbl, req.body)
    .then((rows) => res.json(rows))
    .catch((err) => res.status(400).send(err));
});

router.put("/", (req, res) => {
  svc
    .update(req.params.tbl, req.body)
    .then((rows) => res.json(rows))
    .catch((err) => res.status(400).send(err));
});

module.exports = router;
