Date.prototype.epoch = function () {
  return Math.ceil(this / 1000);
};

Date.prototype.epoch_date = function () {
  return Math.floor(this / 1000 / 60 / 60 / 24);
};
