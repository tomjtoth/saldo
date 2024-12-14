const epoch = (year) => new Date(`${year}-01-01T01:01:01.000Z`);

Date.prototype.epoch = function () {
  return Math.floor((this - epoch(2020)) / 1000);
};

Date.prototype.epoch_date = function () {
  return Math.floor((this - epoch(2020)) / 1000 / 60 / 60 / 24);
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
