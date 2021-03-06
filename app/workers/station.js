import Promise from 'bluebird';
import moment from 'moment';
import { STATION_DISABLED } from '../constants/app';
import * as stationsCalc from '../utils/stationsCalc';
import errorToObject from '../lib/errorToObject';
import calcProgress from '../lib/calcProgress';
import { mathAvg, numberIsBetween } from '../utils/helper';

let db;

// TODO: прелоад данных
// TODO: сделать выборку по частям
// TODO: ipc send bigData, JSON length error
// http://stackoverflow.com/questions/27321392/is-it-expensive-efficient-to-send-data-between-processes-in-node
// http://stackoverflow.com/questions/33842489/node-js-sending-a-big-object-to-child-process-is-slow
// https://github.com/nodejs/node/issues/3145
// http://stackoverflow.com/questions/24582213/how-to-transfer-stream-big-data-from-to-child-processes-in-node-js-without-using

function getProgress(stageName, rowsLength, throttleMs = 150) {
  let stageLength = 0;
  const stages = stageName ? {
    // getStations: {stage: stageLength++, message: "Loading stations list"},
    getStationValues: { stage: stageLength++, message: 'Loading stations values' },
    getLatitudeAvgValues: { stage: stageLength++, message: 'Calculating average values' },
  } : {
    null: { stage: stageLength++, message: 'Loading', event: 'setStationViewProgress' },
  };

  let lastSendTime = null;

  return (rowCurrent) => {
    const progress = {
      title: stages[stageName].message,
      value: calcProgress(stageLength, stages[stageName].stage, rowsLength, rowCurrent).total
    };

    const sendTime = new Date().valueOf();
    if (!lastSendTime || sendTime - lastSendTime > throttleMs) {
      process.send({ event: stages[stageName].event || 'setProgress', data: progress });
      lastSendTime = sendTime;
    }
  };
}

export default function (dbSession, data) {
  if (!data.main.settings) {
    throw new Error("Can't get project settings");
  }

  if (!data.main.settings.projectTimePeriod[0] || !data.main.settings.projectTimePeriod[1]) {
    throw new Error("Can't get time period");
  }

  if (!data.main.settings.projectTimeSelected[0] || !data.main.settings.projectTimeSelected[1]) {
    throw new Error("Can't get time selected");
  }

  db = dbSession;

  (async () => {
    if (data && data.action !== undefined) {
      if (data.action === 'getLatitudeAvgValues') {
        await actionLatitudeAvgValues(data);
      } else if (data.action === 'getStationsValue') {
        await actionStationsValue(data);
      } else if (data.action === 'getStationViewValues') {
        await actionStationViewValues(data);
      }
    }
  })();
}

function actionStationViewValues(data) {
  return new Promise((resolve, reject) => {
    console.time('actionStationViewValues');
    const { settings } = data.main;
    const sqlite = db.sequelize.connectionManager.connections.default;

    const timePeriod = {
      start: moment(settings.projectTimePeriod[0]),
      end: moment(settings.projectTimePeriod[1]),
    };
    const sendProgress = getProgress(null, timePeriod.end.valueOf() - timePeriod.start.valueOf());
    const timeStart = timePeriod.start.valueOf();

    const values = [];

    const query = `
      SELECT 
        id,
        stationId,
        time,
        compX,
        compY,
        compZ,
        format
      FROM StationValues 
      WHERE stationId = ${data.args.stationId} AND (time BETWEEN '${timePeriod.start.format(db.formatTime)}' AND '${timePeriod.end.format(db.formatTime)}')
      ORDER BY time
    `;

    process.send({ consoleLogSQL: `Executing (sqlite): ${query.replace(/\r?\n/g, ' ')}` });
    sqlite.each(query, (err, row) => {
      if (err) {
        reject(err);
      }

      const time = new Date(row.time);

      values.push({
        id: row.id,
        stationId: row.stationId,
        time: row.time,
        compX: row.compX,
        compY: row.compY,
        compZ: row.compZ,
        format: row.format,
      });

      sendProgress(time.valueOf() - timeStart);
    }, () => {
      process.send({ event: 'setStationViewValues', data: values });

      resolve({
        values,
      });

      console.timeEnd('actionStationViewValues');
    });
  });
}

async function actionStationsValue(data) {
  try {
    const stationsValue = await db.StationValue.findAll({
      where: {
        time: moment(data.args.currentTime).format(db.formatTime)
      },
      raw: true
    });
    process.send({ event: 'setStationsValue', data: stationsValue });
  } catch (error) {
    process.send({ event: 'setStationsValueError', data: errorToObject(error) });
    console.error(error);
  }
}

async function actionLatitudeAvgValues(data) {
  const { settings } = data.main;
  const timePeriod = {
    start: moment(settings.projectTimePeriod[0]),
    end: moment(settings.projectTimePeriod[1])
  };
  const timeSelected = {
    start: moment(settings.projectTimeSelected[0]),
    end: moment(settings.projectTimeSelected[1])
  };

  const avgChart = {
    latitudeRanges: settings.projectAvgLatitudeRanges,
    lines: settings.projectAvgComponentLines,
  };

  try {
    const stations = await getStations();
    const stationValues = await getStationValues(stations, timePeriod);
    const result = getLatitudeAvgValues(stationValues, avgChart, timeSelected);

    process.send({ event: 'setLatitudeAvgValues', data: result });
  } catch (error) {
    process.send({ event: 'setError', data: errorToObject(error) });
    console.error(error);
  }
}

function getStations() {
  return db.Station.findAll({ raw: true })
    .then((stations) => {
      // const sendProgress = getProgress('getStations', stations.length);

      const list = {};
      const disabled = [];

      // sendProgress(0);
      stations.forEach((item, i) => {
        if (item.status === STATION_DISABLED) {
          disabled.push(item.id);
        }
        list[item.id] = item;

        // sendProgress(i);
      });

      return { list, disabled };
    });
}

function getStationValues(stations, timePeriod) {
  return new Promise((resolve, reject) => {
    console.time('getStationValues');
    const sqlite = db.sequelize.connectionManager.connections.default;
    const components = {
      compX: null,
      compY: null,
      compZ: null,
    };

    const values = [];
    const extremes = {};

    const query = `
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

    const sendProgress = getProgress('getStationValues', timePeriod.end.valueOf() - timePeriod.start.valueOf());
    const timeStart = timePeriod.start.valueOf();

    process.send({ consoleLogSQL: `Executing (sqlite): ${query.replace(/\r?\n/g, ' ')}` });
    sqlite.each(query, (err, row) => {
      if (err) {
        reject(err);
      }

      row.time = new Date(row.time);

      const station = stations.list[row.stationId];

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
            start: { ...components },
            end: { ...components }
          };
        }
        extremes[row.stationId] = getExtremes(extremes[row.stationId], ['compX', 'compY'], row);
        extremes[row.stationId] = getExtremes(extremes[row.stationId], ['compZ'], row);
      }

      sendProgress(row.time.valueOf() - timeStart);
    }, () => {
      process.send({
        event: 'setStations',
        data: {
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
  const sendProgress = getProgress('getLatitudeAvgValues', data.values.length);
  const { latitudeRanges, lines } = avgChart;
  const latitudeAvgValues = {};
  const maximum = {
    dH: null,
    dD: null,
    dZ: null,
  };

  lines.filter((line) => line.enabled).forEach((line) => {
    if (latitudeAvgValues[line.comp] === undefined) {
      latitudeAvgValues[line.comp] = new Array(latitudeRanges.length).fill(null).map(() => ({}));
    }

    latitudeRanges.forEach((range, rangeKey) => {
      latitudeAvgValues[line.comp][rangeKey][line.hemisphere] = {};
    });
  });

  const components = Object.keys(latitudeAvgValues);

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
        const values = latitudeAvgValues[compKey][latitudeRange][hemisphere][time];
        latitudeAvgValues[compKey][latitudeRange][hemisphere][time] = values.length > 0 ? mathAvg(values) : null;
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
    const stationValue = data.values[i];
    const stationExtremum = data.extremes[stationValue.stationId];
    const stationValueTime = stationValue.time.getTime();
    if (i === 0) {
      lastTime = stationValueTime;
    }

    const delta = stationsCalc.delta(stationValue, stationExtremum);
    const hemisphere = stationValue.longitude <= 180 && stationValue.longitude >= 0 ? 'east' : 'west';

    for (const compKey in maximum) {
      const absValue = Math.abs(delta[compKey]);
      if (maximum[compKey] < absValue) {
        maximum[compKey] = absValue;
      }
    }

    components.forEach((compKey) => {
      latitudeAvgValues[compKey].forEach((item, latitudeRange) => {
        const range = latitudeRanges[latitudeRange];
        const isInRange = stationValue.latitude <= range[0] && stationValue.latitude > range[1];

        if (isInRange) {
          if (numberIsBetween(lastTime, [timeSelected.start.valueOf(), timeSelected.end.valueOf()])) {
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

    sendProgress(i);
  }

  for (const compKey in maximum) {
    maximum[compKey] = maximum[compKey] <= 10 ? Math.ceil(maximum[compKey]) : Math.ceil(maximum[compKey] / 10) * 10;
  }

  console.timeEnd('getLatitudeAvgValues');

  return { latitudeAvgValues, maximum };
}

function getExtremes(extremes, compKeys, row) {
  const tmp = extremes;

  for (let i = 0; i < compKeys.length; i++) {
    const compKey = compKeys[i];
    if (row[compKey] === null || row[compKey] >= stationsCalc.BAD_VALUE) {
      return tmp;
    }

    const extreme = {
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
