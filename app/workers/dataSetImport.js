import Promise from 'bluebird';
import moment from 'moment';
import errorToObject from '../lib/errorToObject';
import calcProgress from '../lib/calcProgress';
import prepareImportData from '../utils/prepareImportData';
import * as geomag from '../lib/geomagneticData/index';

let db;

//TODO: обработка ошибок
//TODO: подготовка данных: raw, интерполяция, среднее, etc
export default function (dbSession, data) {
  if (!data.main.settings) {
    throw new Error("Can't get project settings");
  }

  db = dbSession;

  const {filePaths, fileType} = data;
  const time = {
    period: {
      start: moment(data.main.settings.projectTimePeriod[0]),
      end: moment(data.main.settings.projectTimePeriod[1]),
    },
    avg: data.main.settings.projectTimeAvg,
  };

  let fileCurrent = 0;

  (async () => {
    for (const fileKey in filePaths) {
      const filePath = filePaths[fileKey];

      try {
        process.send({event: 'setCurrentFile', data: filePath});
        const readResult = await readFile(filePaths[fileKey], fileType);
        const data = await prepareImportData(readResult, time);
        const dataSets = await saveDataSets(data);
        await saveDataSetValues(dataSets, filePaths, fileKey)
      } catch (e) {
        console.error(e);
        process.send({event: 'setImportLog', data: {filePath: filePath, error: errorToObject(e)}})
      }
    }
  })();

  Promise.map(filePaths, (filePath) => {
    process.send({event: 'setCurrentFile', filePath});
    return readFile(filePath, fileType)
      .then((rows) => prepareImportData(rows, time))
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
              format: data.format
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

function saveDataSetValues(rows, files, fileCurrent) {
  return new Promise((resolve, reject) => {
    let progress = {
      current: 0,
      total: 0,
    };

    let sqlite = db.sequelize.connectionManager.connections.default;
    sqlite.serialize(function () {
      let query = "INSERT INTO DataSetValues (id, dataSetId, time, value, format) VALUES(NULL, ?, ?, ?, ?);";
      let stmt = sqlite.prepare(query);
      rows.forEach((row, rowCurrent) => {
        stmt.run(row.dataSetId, row.time, row.value, row.format, (error) => {
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
