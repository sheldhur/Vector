Math.sum = function () {
  let values = Array.isArray(arguments[0]) ? arguments[0] : [...arguments];
  return values.reduce((pv, cv) => pv + cv, 0);
};

Math.avg = function () {
  let values = Array.isArray(arguments[0]) ? arguments[0] : [...arguments];
  return Math.sum(values) / values.length;
};

Number.prototype.between = function (rangeArray, bool) {
  let min = Math.min.apply(Math, rangeArray);
  let max = Math.max.apply(Math, rangeArray);

  if (bool === true) {
    return this >= min && this <= max;
  } else if (bool === false) {
    return this > min && this < max;
  } else {
    let number = this;
    number = number < min ? min : number;
    number = number > max ? max : number;

    return number;
  }
};

String.prototype.toCamelCase = function () {
  return this.toLowerCase().replace(/[^a-z0-9]+([a-z0-9])/ig, (str, letter) => {
    return letter.toUpperCase()
  });
};

Date.prototype.getUnixTS = function () {
  return this.getTime() / 1000;
};

Date.prototype.toMinutes = function () {
  return this.getUnixTS() / 60;
};
