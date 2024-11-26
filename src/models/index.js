const imports = [
  require("./user"),
  require("./category"),
  require("./receipt"),
  require("./item"),
  require("./item_share"),
];

module.exports = new Proxy(imports, {
  get(arr, prop) {
    return arr.find((cls) => cls._tbl === prop);
  },
});
