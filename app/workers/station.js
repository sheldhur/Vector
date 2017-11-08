import Promise from 'bluebird';
import moment from 'moment';
import {STATION_DISABLED, STATION_ENABLED} from '../constants/app'
import * as stationsCalc from './../lib/stationsCalc';
import errorToObject from './../lib/errorToObject';
import '../utils/helper';

let db;

//TODO: сделать выборку по частям
//TODO: ipc send bigData, JSON length error
//TODO: прогресс обработки данных
// http://stackoverflow.com/questions/27321392/is-it-expensive-efficient-to-send-data-between-processes-in-node
// http://stackoverflow.com/questions/33842489/node-js-sending-a-big-object-to-child-process-is-slow
// https://github.com/nodejs/node/issues/3145
// http://stackoverflow.com/questions/24582213/how-to-transfer-stream-big-data-from-to-child-processes-in-node-js-without-using
//TODO: прелоад данных

export default function (dbSession, data) {
  if (!data.main.settings || !data.main.settings.project) {
    throw new Error("Can't get project settings");
  }

  db = dbSession;

  if (data && data.action !== undefined) {
    if (data.action === 'getLatitudeAvgValues') {
      actionLatitudeAvgValues(data);
    } else if (data.action === 'getStationsValue') {
      actionStationsValue(data);
    } else if (data.action === 'getStationViewValues') {
      actionStationViewValues(data);
    }
  }
}

function actionStationViewValues(data) {
  let {time} = data.main.settings.project;

  if (!time.period.start || !time.period.end) {
    throw new Error("Can't get time period");
  }

  time.period.start = moment(time.period.start);
  time.period.end = moment(time.period.end);

  db.StationValue.findAll({
    where: {
      ...data.args,
      time: {
        $between: [
          time.period.start.format(db.formatTime),
          time.period.end.format(db.formatTime)
        ]
      }
    },
    raw: true
  }).then((result) => {
    process.send({event: 'setStationViewValues', data: result});
  }).catch((error) => {
    console.error(error);
    process.send({event: 'setStationViewError', data: errorToObject(error)});
  });
}

function actionStationsValue(data) {
  db.StationValue.findAll({
    where: {
      time: moment(data.args.currentTime).format(db.formatTime)
    },
    raw: true
  }).then((result) => {
    process.send({event: 'setStationsValue', data: result});
  }).catch((error) => {
    console.error(error);
    process.send({event: 'setStationsValueError', data: errorToObject(error)});
  });
}

function actionLatitudeAvgValues(data) {
  // let {components} = data;
  let {time, avgChart} = data.main.settings.project;

  if (!time.period.start || !time.period.end) {
    throw new Error("Can't get time period");
  }

  time.period.start = moment(time.period.start);
  time.period.end = moment(time.period.end);

  time.selected.start = moment(time.selected.start);
  time.selected.end = moment(time.selected.end);

  getStations()
    .then((stations) => getStationValues(stations, time.period))
    .then((result) => getLatitudeAvgValues(result, avgChart, time.selected))
    .catch((error) => {
      console.error(error);
      process.send({event: 'setError', data: errorToObject(error)});
    });
}

function getStations() {
  return db.Station.findAll({raw: true})
    .then((stations) => {
      let list = {};
      let disabled = [];

      stations.forEach((item) => {
        if (item.status === STATION_DISABLED) {
          disabled.push(item.id);
        }
        list[item.id] = item;
      });

      return {list, disabled};
    });
}

function getStationValues(stations, timePeriod) {
  return new Promise((resolve, reject) => {
    console.time('getStationValues');
    let sqlite = db.sequelize.connectionManager.connections.default;
    let components = {
      compX: null,
      compY: null,
      compZ: null,
    };

    let values = [];
    let extremes = {};

    let query = `
      SELECT 
        stationId,
        time,
        compX,
        compY,
        compZ
      FROM StationValues 
      WHERE stationId NOT IN (${stations.disabled}) AND (time BETWEEN '${timePeriod.start.format(db.formatTime)}' AND '${timePeriod.end.format(db.formatTime)}')
      ORDER BY time
    `;

    process.send({consoleLogSQL: 'Executing (sqlite): ' + query.replace(/\r?\n/g, ' ')});
    sqlite.each(query, (err, row) => {
      if (err) {
        reject(err);
      }

      row.time = new Date(row.time);

      let station = stations.list[row.stationId];

      if (station !== undefined) {
        values.push({
          stationId: row.stationId,
          latitude: station.latitude,
          longitude: stationsCalc.longitude(station.longitude),
          time: row.time,
          compX: row.compX,
          compY: row.compY,
          compZ: row.compZ,
        });

        if (extremes[row.stationId] === undefined) {
          extremes[row.stationId] = {
            start: {...components},
            end: {...components}
          }
        }
        extremes[row.stationId] = getExtremes(extremes[row.stationId], ['compX', 'compY'], row);
        extremes[row.stationId] = getExtremes(extremes[row.stationId], ['compZ'], row);
      }
    }, () => {
      process.send({
        event: 'setStations', data: {
          stations: stations.list,
          extremes
        }
      });

      resolve({
        values,
        extremes,
      });

      console.timeEnd('getStationValues');
    });
  });
}

function getLatitudeAvgValues(data, avgChart, timeSelected) {
  console.time('getLatitudeAvgValues');
  const {latitudeRanges, lines} = avgChart;
  let latitudeAvgValues = {};
  let maximum = {
    dH: null,
    dD: null,
    dZ: null,
  };

  lines.filter((line) => line.enabled).forEach((line) => {
    if (latitudeAvgValues[line.comp] === undefined) {
      latitudeAvgValues[line.comp] = new Array(latitudeRanges.length).fill(null).map(() => {
        return {}
      });
    }

    latitudeRanges.forEach((range, rangeKey) => {
      latitudeAvgValues[line.comp][rangeKey][line.hemisphere] = {};
    });
  });

  let components = Object.keys(latitudeAvgValues);

  function latitudeValuesAdd(compKey, latitudeRange, hemisphere, time, value) {
    if (latitudeAvgValues[compKey][latitudeRange][hemisphere] !== undefined) {
      if (latitudeAvgValues[compKey][latitudeRange][hemisphere][time] === undefined) {
        latitudeAvgValues[compKey][latitudeRange][hemisphere][time] = [];
      }

      if (value !== null) {
        latitudeAvgValues[compKey][latitudeRange][hemisphere][time].push(value);
      }
    }
  }

  function latitudeValuesAvg(compKey, latitudeRange, hemisphere, time) {
    if (latitudeAvgValues[compKey][latitudeRange][hemisphere] !== undefined) {
      if (latitudeAvgValues[compKey][latitudeRange][hemisphere][time] !== undefined) {
        let values = latitudeAvgValues[compKey][latitudeRange][hemisphere][time];
        latitudeAvgValues[compKey][latitudeRange][hemisphere][time] = values.length > 0 ? Math.avg(values) : null;
      }
      // if (latitudeAvgValues[compKey][latitudeRange][hemisphere][time] === undefined) {
      //   latitudeAvgValues[compKey][latitudeRange][hemisphere][time] = null;
      // } else {
      //   let avgValues = latitudeAvgValues[compKey][latitudeRange][hemisphere][time].avg();
      //   latitudeAvgValues[compKey][latitudeRange][hemisphere][time] = avgValues;
      // }
    }
  }

  let lastTime = null;
  for (let i = 0; i < data.values.length; i++) {
    let stationValue = data.values[i];
    let stationExtremum = data.extremes[stationValue.stationId];
    let stationValueTime = stationValue.time.getTime();
    if (i === 0) {
      lastTime = stationValueTime;
    }

    let delta = stationsCalc.delta(stationValue, stationExtremum);
    let hemisphere = stationValue.longitude <= 180 && stationValue.longitude >= 0 ? 'east' : 'west';

    for (let compKey in maximum) {
      let absValue = Math.abs(delta[compKey]);
      if (maximum[compKey] < absValue) {
        maximum[compKey] = absValue;
      }
    }

    components.forEach((compKey) => {
      latitudeAvgValues[compKey].forEach((item, latitudeRange) => {
        let range = latitudeRanges[latitudeRange];
        let isInRange = stationValue.latitude <= range[0] && stationValue.latitude > range[1];

        if (isInRange) {
          if (lastTime.between([timeSelected.start.valueOf(), timeSelected.end.valueOf()], true)) {
            latitudeValuesAdd(compKey, latitudeRange, hemisphere, lastTime, delta[compKey]);
            latitudeValuesAdd(compKey, latitudeRange, 'global', lastTime, delta[compKey]);
          }
        }

        if (stationValue.time.getTime() !== lastTime || i === data.values.length - 1) {
          latitudeValuesAvg(compKey, latitudeRange, 'east', lastTime);
          latitudeValuesAvg(compKey, latitudeRange, 'west', lastTime);
          latitudeValuesAvg(compKey, latitudeRange, 'global', lastTime);
        }
      });
    });

    if (stationValueTime !== lastTime || i === data.values.length - 1) {
      lastTime = stationValueTime;
    }
  }

  for (let compKey in maximum) {
    maximum[compKey] = maximum[compKey] <= 10 ? Math.ceil(maximum[compKey]) : Math.ceil(maximum[compKey] / 10) * 10;
  }

  console.timeEnd('getLatitudeAvgValues');
  process.send({event: 'setLatitudeAvgValues', data: {latitudeAvgValues, maximum}});
}

function getExtremes(extremes, compKeys, row) {
  let tmp = extremes;

  for (let i = 0; i < compKeys.length; i++) {
    let compKey = compKeys[i];
    if (row[compKey] === null || row[compKey] >= stationsCalc.BAD_VALUE) {
      return tmp;
    }

    let extreme = {
      time: row.time,
      value: row[compKey]
    };

    if (extremes.start[compKey] === null) {
      extremes.start[compKey] = extreme;
    }
    extremes.end[compKey] = extreme;
  }

  return extremes;
}
