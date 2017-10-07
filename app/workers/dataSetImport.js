import Promise from 'bluebird';
import moment from 'moment';
import errorToObject from '../lib/errorToObject';
import calcProgress from '../lib/calcProgress';
import * as geomag from '../lib/geomagneticData/index';
import {
  VALUES_AVG,
  VALUES_INTERPOLATED,
  VALUES_MAX,
  VALUES_MIN,
  VALUES_RAW
} from '../constants/app';

let db;

//TODO: обработка ошибок
//TODO: подготовка данных: raw, интерполяция, среднее, etc
export default function (dbSession, data) {
  if (!data.main.settings || !data.main.settings.project) {
    throw new Error("Can't get project settings");
  }

  db = dbSession;

  let {filePaths, fileType} = data;
  let {time} = data.main.settings.project;

  time.period.start = moment(time.period.start);
  time.period.end = moment(time.period.end);

  let fileCurrent = 0;

  Promise.map(filePaths, (filePath) => {
    process.send({event: 'setCurrentFile', filePath});
    return readFile(filePath, fileType)
      .then((rows) => prepareValues(rows, time))
      .then((data) => saveDataSets(data))
      .then((rows) => saveDataSetValues(rows, filePaths, fileCurrent++))
      .catch((error) => {
        console.error(error);
      })
  }, {concurrency: 1});
}

function readFile(filePath, fileType) {
  if (fileType === 'CDAWeb') {
    return geomag.cdaweb(filePath);
  } else if (fileType === 'CSV') {
    return geomag.csv(filePath);
  } else if (fileType === 'GOES') {
    return geomag.goes(filePath);
  }

  return Promise.reject(new Error('File type not selected'));
}

function saveDataSets(data) {
  return new Promise((resolve, reject) => {
    let results = [];
    Promise.map(data.columns, (item, i) => {
      if (i > 0 && item.name !== '') {
        return db.DataSet.findOrCreate({
          where: {name: item.name},
          defaults: {
            name: item.name,
            si: item.si || item.name,
          }
        }).then((dataSet) => {
          let id = dataSet[0].id;
          data.rows.forEach((row, j) => {
            results.push({
              dataSetId: id,
              time: moment(row[0]).format(db.formatTime),
              value: row[i],
            });
          });
        }).catch(e => {
          console.log('saveDataSet: ' + errorToObject(e));
        });
      }
    }, {concurrency: 1}).then(() => {
      resolve(results);
    }, (error) => {
      reject(error);
    });
  });
}

function prepareValues(data, time) {
  let {rows} = data;
  let {avg} = time;
  avg.time = (avg.by.startsWith('min') ? avg.value * 60 : avg.value) * 1000; //ms

  const timeDataFrequency = (rows[1][0].valueOf() - rows[0][0].valueOf());

  let format = VALUES_RAW;
  rows = prepareRawValues(rows, time, data.properties.badValue || 99999);
  if (timeDataFrequency !== avg.time) {
    if (timeDataFrequency < avg.time) {
      format = VALUES_AVG;
      rows = prepareFormatedValues(rows, time, format);
    } else if (timeDataFrequency > avg.time) {
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

function prepareRawValues(rows, time, badValue) {
  const {period} = time;

  const rowLength = rows[0].length;

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
  const {period, avg} = time;

  if (rows.length === 0) {
    return [];
  }

  const timeStartPeriod = period.start.valueOf();
  const timeStartData = rows[0][0].valueOf();

  let timeStart = timeStartPeriod;
  if (timeStartPeriod < timeStartData) {
    timeStart += (avg.time * Math.floor((timeStartData - timeStartPeriod) / avg.time))
  }

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

function prepareInterpolatedValues(rows, time, method = VALUES_RAW) {
  console.log('prepareInterpolatedValues');
  return [];
}

function saveDataSetValues(rows, files, fileCurrent) {
  return new Promise((resolve, reject) => {
    let progress = {
      current: 0,
      total: 0,
    };

    let sqlite = db.sequelize.connectionManager.connections.default;
    sqlite.serialize(function () {
      let query = "INSERT INTO DataSetValues (id, dataSetId, time, value) VALUES(NULL, ?, ?, ?);";
      let stmt = sqlite.prepare(query);
      rows.forEach((row, rowCurrent) => {
        stmt.run(row.dataSetId, row.time, row.value, (error) => {
          let newProgress = calcProgress(files.length, fileCurrent, rows.length, rowCurrent);
          if (newProgress.current > progress.current) {
            progress = newProgress;
            process.send({event: 'setProgress', progress});
          }

          if (error) {
            //process.send({event: 'progress', error: {name: error.name, message: error.message}, value});
          }
        });
      });
      stmt.finalize((error) => {
        //process.send({event: 'result', error});
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
    });
  });
}
