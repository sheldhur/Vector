import Promise from 'bluebird';
import moment from 'moment';
import errorToObject from '../lib/errorToObject';
import calcProgress from '../lib/calcProgress';
import prepareImportData from '../utils/prepareImportData';
import * as geomag from '../lib/geomagneticData';

let db;

const M2R = Math.PI / (180 * 60);

//TODO: обработка ошибок
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

  (async () => {
    for (const fileKey in filePaths) {
      const filePath = filePaths[fileKey];

      try {
        process.send({event: 'setCurrentFile', data: filePath});
        const readResult = await readFile(filePaths[fileKey], fileType);
        const stationsData = Array.isArray(readResult) ? readResult : [readResult];

        for (const stationKey in stationsData) {
          const stationData = stationsData[stationKey];

          const data = await saveStation(stationData, fileType);
          const values = await prepareImportData(data, time, 4);
          await saveStationValues(values, filePaths, stationsData, fileKey);
        }
      } catch (e) {
        console.error(e);
        process.send({event: 'setImportLog', data: {filePath: filePath, error: errorToObject(e)}})
      }
    }
  })();
}

function readFile(filePath, fileType) {
  if (fileType === 'IAGA-2002') {
    return geomag.iaga2002(filePath);
  } else if (fileType === 'CARISMA') {
    return geomag.carisma(filePath);
  } else if (fileType === 'CDAWeb') {
    return geomag.cdawebThemis(filePath);
  } else if (fileType === '210 MM') {
    return geomag.mm210(filePath);
  } else if (fileType === 'MagBase') {
    return geomag.magBase(filePath);
  } else if (fileType === 'SAMNET') {
    return geomag.samnet(filePath);
  } else if (fileType === 'IMAGE') {
    return geomag.imageColumnOld(filePath);
  } else {
    return Promise.reject(new Error(`File type ${fileType} is not supported`));
  }
}

function saveStation(data, fileType) {
  let props = {
    name: data.properties.code.toUpperCase(),
    source: fileType,
    reported: data.properties.reported.toUpperCase(),
    latitude: Number(data.properties.geodeticLatitude.toFixed(3)),
    longitude: Number(data.properties.geodeticLongitude.toFixed(3))
  };

  return db.Station.findOrCreate({
    where: {name: props.name, source: props.source},
    defaults: props
  }).then((station) => {
    data.station = station[0];
    data.properties = {
      ...data.properties,
      ...props
    };

    process.send({event: 'addStation', data: data.station});

    return data;
  });
}

function saveStationValues(data, files, stations, fileCurrent) {
  let {station, format, rows} = data;

  return new Promise((resolve, reject) => {
    let progress = {
      current: 0,
      total: 0,
    };

    let sqlite = db.sequelize.connectionManager.connections.default;
    sqlite.serialize(function () {
      let query = "INSERT INTO StationValues (id, time, compX, compY, compZ, stationId, format) VALUES(NULL, ?, ?, ?, ?, ?, ?);";
      let stmt = sqlite.prepare(query);
      rows.forEach((row, rowCurrent) => {
        row = convertToXY(row, station.reported);
        row[0] = moment(row[0]).format(db.formatTime);
        stmt.run(...row, station.id, format, (error) => {
          let newProgress = calcProgress(files.length * stations.length, fileCurrent, rows.length, rowCurrent);
          if (newProgress.current > progress.current) {
            progress = newProgress;
            process.send({event: 'setProgress', data: progress});
          }

          if (error) {
            // console.error(error);
            //process.send({event: 'progress', error: {name: error.name, message: error.message}, value});
          }
        });
      });
      stmt.finalize((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
    });
  });
}

function convertToXY(values, reported = 'XYZF') {
  if (!reported.startsWith('XY')) {
    let X, Y;
    if (reported.startsWith('HD')) {
      let H = values[1];
      let D = values[2];
      if (H === null || D === null) {
        X = null;
        Y = null;
      } else {
        X = H * Math.cos(D * M2R);
        Y = H * Math.sin(D * M2R);
      }
    } else if (reported.startsWith('HY')) {
      let H = values[1];
      let Y = values[2];
      if (H === null || Y === null) {
        X = null;
      } else {
        X = Math.sqrt((H ** 2) - (Y ** 2));
      }
    }

    values[1] = X;
    values[2] = Y;
  }

  return values;
}
