const express = require("express");
const { PORT, IMPORT_CSV } = require("./utils/config");
const usersRoute = require("./controllers/users");
const import_v3 = require("./utils/import_v3");

if (IMPORT_CSV) import_v3(IMPORT_CSV);

const app = express();

app.use("/api/users", usersRoute);

app.start = () => {
  app.listen(PORT);
  console.log(`listening on port ${PORT}`);
};

module.exports = app;
