const express = require("express");
const { PORT, IMPORT_CSV } = require("./utils/config");
const generic_route = require("./controllers");
const import_v3 = require("./utils/import_v3");

if (IMPORT_CSV) import_v3(IMPORT_CSV);

const app = express();

app.use(express.json());
app.use(
  /\/api\/(?<tbl>(?:users|categories|receipts|items)(?:_history)?)/,
  generic_route
);

app.start = () => {
  app.listen(PORT);
  console.log(`listening on port ${PORT}`);
};

module.exports = app;
