import Promise from 'bluebird';
import moment from 'moment';
import errorToObject from '../lib/errorToObject';

let db;

export default function (dbSession, data) {
  if (!data.main.settings || !data.main.settings.project) {
    throw new Error("Can't get project settings");
  }

  db = dbSession;

  let {time} = data.main.settings.project;

  if (!time.selected.start || !time.selected.end) {
    throw new Error("Can't get time period");
  }

  time.selected.start = moment(time.selected.start);
  time.selected.end = moment(time.selected.end);

  getDataSets()
    .then((dataSets) => getDataSetValues(dataSets, time))
    .then((result) => prepareData(result))
    .then((result) => {
      process.send({event: 'setData', data: result});
    })
    .catch((error) => {
      console.error(error);
      process.send({event: 'setError', data: errorToObject(error)});
    });
}

function getDataSets() {
  return db.DataSet.findAll({
    where: {},
    raw: true
  });
}

function getDataSetValues(dataSets, time) {
  return Promise.map(dataSets, (dataSet) => {
    return db.DataSetValue.findAll({
      where: {
        dataSetId: dataSet.id,
        time: {
          $between: [
            time.selected.start.format(db.formatTime),
            time.selected.end.format(db.formatTime)
          ]
        }
      },
      raw: true
    });
  }).then((dataSetValues) => {
    return {
      dataSets,
      dataSetValues,
    };
  });
}

function prepareData(data) {
  let result = {
    dataSets: {},
    dataSetValues: {}
  };

  data.dataSets.forEach((dataSet, dataSetKey) => {
    dataSet.style = JSON.parse(dataSet.style);
    result.dataSets[dataSet.id] = dataSet;
    result.dataSetValues[dataSet.id] = data.dataSetValues[dataSetKey];
  });

  return result;
}
