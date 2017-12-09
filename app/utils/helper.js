export const mathSum = (values) => {
  return values.reduce((pv, cv) => pv + cv, 0);
};

export const mathAvg = (values) => {
  return mathSum(values) / values.length;
};

export const dateToUnixTS = (date) => {
  return date.getTime() / 1000;
};

export const dateToMinutes = (date) => {
  return dateToUnixTS(date) / 60;
};

export const stringCamelCase = (string) => {
  return string.trim().toLowerCase().replace(/[^a-z0-9]+([a-z0-9])/ig, (str, letter) => {
    return letter.toUpperCase()
  });
};

export const numberIsBetween = (value, range, exact = true, bool = true) => {
  const min = Math.min(...range);
  const max = Math.max(...range);

  if (bool) {
    if (exact) {
      return value >= min && value <= max;
    } else {
      return value > min && value < max;
    }
  } else {
    let number = value;
    if (exact) {
      number = number < min ? min : number;
      number = number > max ? max : number;
    } else {
      number = number <= min ? min : number;
      number = number >= max ? max : number;
    }

    return number;
  }
};
