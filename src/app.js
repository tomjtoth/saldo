const express = require("express");
const { PORT, IMPORT_CSV } = require("./utils/config");
const import_v3 = require("./utils/import_v3");
const { item_shares, generic, add_rcpt, login } = require("./controllers");
const {
  token_extractor,
  user_extractor,
  error_handler,
} = require("./utils/middleware");

if (IMPORT_CSV) import_v3(IMPORT_CSV);

const app = express();

app.use(express.json(), token_extractor, user_extractor);
app.use(
  /\/api\/(?<tbl>(?:users|categories|receipts|items)(?:_history)?)/,
  generic
);
app.use(/\/api\/(?<tbl>item_shares(?:_history)?)/, item_shares);
app.use("/api/add_rcpt", add_rcpt);
app.use("/login", login);

app.use(error_handler);

app.start = () => {
  app.listen(PORT);
  console.log(`listening on port ${PORT}`);
};

module.exports = app;
