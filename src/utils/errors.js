class ValidationError extends Error {
  name = "model field validation";
}

const qt = (val) => JSON.stringify(val);

module.exports = { ValidationError, qt };
