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
      .then((data) => saveDataSets(data, time.period))
      .then((rows) => saveDataSetValues(rows, filePaths, fileCurrent++))
      .catch((error) => {
        console.error(error);
      })
  }, {concurrency: 1});
}

function readFile(filePath, fileType) {
  if (fileType === 'CDAWeb') {
    return geomag.cdaWebData(filePath);
  } else if (fileType === 'CSV') {
    return geomag.csv(filePath);
  } else if (fileType === 'GOES') {
    return geomag.goes(filePath);
  }

  return Promise.reject(new Error('File type not selected'));
}

function saveDataSets(data, timePeriod) {
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
            // if (!timePeriod || (timePeriod && true)) {
            results.push({
              dataSetId: id,
              time: moment(row[0]).format(db.formatTime),
              value: row[i],
            });
            // }
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
