/**
 *
 * @returns seconds since 1970-01-01 as a Number
 */
Date.prototype.epoch = function () {
  return Math.ceil(this / 1000);
};

/**
 *
 * @returns days since 1970-01-01 as a Number
 */
Date.prototype.epoch_date = function () {
  return Math.floor(this / 1000 / 60 / 60 / 24);
};

/**
 *
 * @returns days since 1970-01-01 as a Number
 */
Date.prototype.toISODate = function () {
  return this.toISOString().slice(0, 10);
};
