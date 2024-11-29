module.exports = new Proxy(
  [
    require("./revision"),
    require("./user"),
    require("./category"),
    require("./receipt"),
    require("./item"),
    require("./item_share"),
  ],
  {
    get(arr, prop) {
      return arr.find((cls) => cls._tbl === prop);
    },
  }
);
