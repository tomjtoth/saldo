const jwt = require("jsonwebtoken");
const { compare } = require("bcrypt");
const router = require("express").Router();
const User = require("../models/user");
const svc = require("../services");

router.post("/", async ({ body: { email, password } }, res, next) => {
  const user = await svc.query("users", {
    where: "email = ?",
    params: [email],
  });
  if (!user)
    return next({
      name: "AuthErr",
      message: "user not found",
    });

  const { _id: id, username, passwordHash, name } = user;

  if (!(await compare(password, passwordHash)))
    return next({
      name: "AuthErr",
      message: "wrong password",
    });

  const token = jwt.sign({ username, id }, process.env.SECRET);

  res.status(200).send({ token, username, name });
});

module.exports = router;
