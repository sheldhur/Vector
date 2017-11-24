import naturalSplineInterpolator from 'natural-spline-interpolator';
import {
  VALUES_AVG,
  VALUES_INTERPOLATED,
  VALUES_MAX,
  VALUES_MIN,
  VALUES_RAW,
  FORMAT_DATE_SQL
} from '../constants/app';

function calcTimeExtreme (period, data, avg, startOrEnd) {
  const timePeriod = period.valueOf();
  const timeData = data.valueOf();

  const timeDiff = (avg * Math.floor((timeData - timePeriod) / avg));

  let time = timePeriod;
  if (startOrEnd === 'start' && timePeriod < timeData) {
    time += timeDiff;
  } else if (startOrEnd === 'end' && timePeriod > timeData) {
    time += timeDiff;
  }

  return time;
};

function prepareValues(data, time, rowLength) {
  let {rows} = data;
  let {avg} = time;
  avg.time = (avg.by.startsWith('min') ? avg.value * 60 : avg.value) * 1000; //ms

  time.extreme = {
    frequency: rows[1][0].valueOf() - rows[0][0].valueOf(),
    start: calcTimeExtreme(time.period.start, rows[0][0], avg.time, 'start'),
    end: calcTimeExtreme(time.period.end, rows[rows.length - 1][0], avg.time, 'end')
  };

  let format = VALUES_RAW;
  rows = prepareRawValues(rows, time, rowLength, data.properties.badValue || 99999);
  if (time.extreme.frequency !== avg.time) {
    if (time.extreme.frequency < avg.time) {
      format = VALUES_AVG;
      rows = prepareFormatedValues(rows, time, format);
    } else if (time.extreme.frequency > avg.time) {
      format = VALUES_INTERPOLATED;
      rows = prepareInterpolatedValues(rows, time);
    }
  }

  return {
    ...data,
    format,
    rows,
  }
}

function prepareRawValues(rows, time, rowLength, badValue) {
  const {period} = time;

  if (!rowLength) {
    rowLength = rows[0].length;
  }

  let addon = Array.from({length: rowLength - rows.length}, () => null);
  let result = [];
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];

    if (row[0].valueOf().between([period.start.valueOf(), period.end.valueOf()], true)) {
      if (row.length > rowLength) {
        row = row.slice(0, rowLength);
      } else if (row.length < rowLength) {
        row = row.concat(addon);
      }

      row = row.map((item, i) => {
        if (i > 0 && item >= badValue) {
          item = null;
        }

        return item;
      });

      result.push(row);
    } else if (row[0].valueOf() > period.end.valueOf()) {
      break
    }
  }

  return result;
}

function prepareFormatedValues(rows, time, method = VALUES_RAW) {
  const {avg, extreme} = time;

  if (rows.length === 0) {
    return [];
  }

  let timeStart = extreme.start;

  let result = {};
  rows.forEach((row, i) => {
    if (result[timeStart] === undefined) {
      result[timeStart] = [];
      for (let j = 0; j < row.length; j++) {
        result[timeStart].push([]);
      }
    }

    for (let j = 1; j < row.length; j++) {
      if (row[j] !== null) {
        result[timeStart][j].push(row[j]);
      }
    }

    if (row[0].valueOf() >= timeStart || i === rows.length - 1) {
      result[timeStart] = result[timeStart].map((comp, i) => {
        if (i === 0) {
          return timeStart;
        } else {
          if (comp.length) {
            switch (method) {
              case VALUES_MAX:
                return Math.max(...comp);
              case VALUES_MIN:
                return Math.min(...comp);
              case VALUES_AVG:
                return Math.avg(...comp);
              default:
                return Math.avg(...comp);
            }
          } else {
            return null;
          }
        }
      });
      timeStart += avg.time;
    }
  });

  return Object.values(result);
}

function prepareInterpolatedValues(rows, time, method = VALUES_INTERPOLATED) {
  const {avg, extreme} = time;

  let timeValues = [];
  rows.forEach((row, i) => {
    for (let j = 1; j < row.length; j++) {
      if (i === 0) {
        timeValues.push([]);
      } else {
        timeValues[j - 1].push([row[0].valueOf(), row[j]]);
      }
    }
  });

  timeValues = timeValues.map((item) => naturalSplineInterpolator(item));

  let result = [];
  for (let i = extreme.start; i <= extreme.end; i = i + avg.time) {
    let tmp = [new Date(i)];
    for (let j = 0; j < timeValues.length; j++) {
      tmp.push(timeValues[j](i));
    }

    result.push(tmp);
  }

  return result;
}

export default prepareValues;
