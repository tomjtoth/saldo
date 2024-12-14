const models = require("../models");

module.exports = {
  query: async (tbl, crit) => {
    return models[tbl].select(crit);
  },

  create: async (tbl, body, rev_by) => {
    return models[tbl].insert([body], { rev_by });
  },

  delete: async (tbl, id, rev_by) => {
    return models[tbl].delete(id, { rev_by });
  },

  update: async (tbl, id, body, rev_by) => {
    const model = models[tbl];
    const [entity] = await model.select({ where: { id } });

    return model.update([entity], { ...body, rev_by });
  },
};
