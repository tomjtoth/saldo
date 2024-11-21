const models = require("../models");

module.exports = {
  query: async (tbl, crit) => {
    return models[tbl].select(crit);
  },

  create: async (tbl, body, user) => {
    return models[tbl].insert(body, user);
  },

  delete: async (tbl, body, user) => {
    return models[tbl].delete(body, user);
  },

  update: async (tbl, body, user) => {
    return models[tbl].update(body, user);
  },
};
