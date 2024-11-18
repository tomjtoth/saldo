const { mailing: svc } = require("../services");
const router = require("express").Router({ mergeParams: true });

router.post("/", async ({ body }, res) => {
  res.send(await svc.send(body));
});

module.exports = router;
