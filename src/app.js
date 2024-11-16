const express = require("express");
const { PORT, IMPORT_CSV } = require("./utils/config");
const import_v3 = require("./utils/import_v3");
const { item_shares, generic } = require("./controllers");

if (IMPORT_CSV) import_v3(IMPORT_CSV);

const app = express();

app.use(express.json());
app.use(
  /\/api\/(?<tbl>(?:users|categories|receipts|items)(?:_history)?)/,
  generic
);
app.use(/\/api\/(?<tbl>item_shares(?:_history)?)/, item_shares);

app.start = () => {
  app.listen(PORT);
  console.log(`listening on port ${PORT}`);
};

module.exports = app;
