const express = require("express");
const { PORT, IMPORT_CSV } = require("./utils/config");
const generic_route = require("./controllers");
const import_v3 = require("./utils/import_v3");

if (IMPORT_CSV) import_v3(IMPORT_CSV);

const app = express();

app.use(express.json());
app.use("/api/users", generic_route("users"));
app.use("/api/categories", generic_route("categories"));
app.use("/api/receipts", generic_route("receipts"));
app.use("/api/items", generic_route("items"));


app.start = () => {
  app.listen(PORT);
  console.log(`listening on port ${PORT}`);
};

module.exports = app;
