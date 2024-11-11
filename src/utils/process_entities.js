/**
 * preps an array of Model entities for SQL statements
 *
 * @param {Model[]} entities
 * @param {Object} opts
 * @returns
 */
module.exports = function (entities, opts = null) {
  let cols = Object.keys(entities[0]);

  if (opts && opts.omit_id) cols = cols.filter((col) => col !== "id");

  const placeholders = `(${cols.map(() => "?").join(",")})`;
  const params_as_arr = entities.map((entity) => {
    const ordered_values = [];
    cols.forEach((field) => {
      ordered_values.push(entity[field]);
    });
    return ordered_values;
  });

  return {
    cols,
    placeholders,
    params_as_arr,
  };
};
