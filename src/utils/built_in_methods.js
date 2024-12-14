const epoch = (year) => new Date(`${year}-01-01T00:00:00.000Z`);
const SEC = 1000;
const DAY = SEC * 60 * 60 * 24;

Date.prototype.to_epoch = function () {
  return Math.floor((this - epoch(2020)) / SEC);
};

Date.from_epoch = function (elapsed) {
  return new this(epoch(2020).valueOf() + elapsed * SEC);
};

Date.prototype.to_epoch_date = function () {
  return Math.floor((this - epoch(2020)) / DAY);
};

Date.from_epoch_date = function (elapsed) {
  return new this(epoch(2020).valueOf() + elapsed * DAY);
};

Date.prototype.toISODate = function () {
  return this.toISOString().slice(0, 10);
};

Array.prototype.toChunks = function (chunk_size) {
  const result = [];

  for (let i = 0; i < this.length; i += chunk_size) {
    result.push(this.slice(i, i + chunk_size));
  }

  return result;
};
