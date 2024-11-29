const models = require("../models");

module.exports = {
  query: async (tbl, crit) => {
    return models[tbl].select(crit);
  },

  create: async (tbl, body, rev_by) => {
    return models[tbl].insert(body, { rev_by });
  },

  delete: async (tbl, body, rev_by) => {
    return models[tbl].delete(body, { rev_by });
  },

  update: async (tbl, body, rev_by) => {
    return models[tbl].update(body, { rev_by });
  },
};
