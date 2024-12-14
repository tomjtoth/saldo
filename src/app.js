const express = require("express");
require("./utils/built_in_methods");
const { PORT, IMPORT_CSV } = require("./utils/config");
const { sql } = require("./db");
const import_v3 = require("./utils/import_v3");
const { generic, login, mailing } = require("./controllers");
const {
  token_extractor,
  user_extractor,
  error_handler,
} = require("./utils/middleware");

if (IMPORT_CSV) import_v3(IMPORT_CSV);

const app = express();

app.use(express.json(), token_extractor, user_extractor);
app.use(
  /\/api\/(?<hist>history\.)?(?<tbl>(?:users|categories|receipts|item(?:_share)?s))/,
  generic
);
app.use("/api/login", login);
app.use("/api/log", async (_req, res) =>
  res.send(await sql`select * from log`)
);
app.use("/api/mailing", mailing);

app.use(error_handler);

app.start = () => {
  app.listen(PORT);
  console.log(`listening on port ${PORT}`);
};

module.exports = app;
