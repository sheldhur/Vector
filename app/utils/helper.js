export const mathSum = (values) => values.reduce((pv, cv) => pv + cv, 0);

export const mathAvg = (values) => mathSum(values) / values.length;

export const dateToUnixTS = (date) => date.getTime() / 1000;

export const dateToMinutes = (date) => dateToUnixTS(date) / 60;

export const stringCamelCase = (string) => string.trim().toLowerCase().replace(/[^a-z0-9]+([a-z0-9])/ig, (str, letter) => letter.toUpperCase());

export const numberIsBetween = (value, range, exact = true, bool = true) => {
  const min = Math.min(...range);
  const max = Math.max(...range);

  if (bool) {
    if (exact) {
      return value >= min && value <= max;
    }
    return value > min && value < max;
  }
  let number = value;
  if (exact) {
    number = number < min ? min : number;
    number = number > max ? max : number;
  } else {
    number = number <= min ? min : number;
    number = number >= max ? max : number;
  }

  return number;
};

export const isHexColor = (value) => {
  const sNum = value.replace('#', '');
  return (typeof sNum === 'string') && sNum.length === 6 && !isNaN(parseInt(sNum, 16));
};

export const createRange = (start, end) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }

  return result;
};
