import Promise from 'bluebird';
import moment from 'moment';
import errorToObject from '../lib/errorToObject';
import calcProgress from '../lib/calcProgress';

let db;

export default function (dbSession, data) {
  if (!data.main.settings) {
    throw new Error("Can't get project settings");
  }

  db = dbSession;

  const {projectTimeSelected} = data.main.settings;
  if (!projectTimeSelected[0] || !projectTimeSelected[1]) {
    throw new Error("Can't get time period");
  }

  getDataSets()
    .then((dataSets) => getDataSetValues(dataSets, projectTimeSelected))
    .then((result) => prepareData(result))
    .then((result) => {
      process.send({event: 'setData', data: result});
    })
    .catch((error) => {
      console.error(error);
      process.send({event: 'setError', data: errorToObject(error)});
    });
}

function getProgress(stageName, rowsLength) {
  let stageLength = 0;
  const stages = {
    // getDataSets: {stage: stageLength++, message: "Loading datasets"},
    getDataSetValues: {stage: stageLength++, message: "Loading datasets values"},
    prepareData: {stage: stageLength++, message: "Prepare data"}
  };

  let lastProgress = null;

  return (rowCurrent) => {
    const progress = {
      title: stages[stageName].message,
      value: calcProgress(stageLength, stages[stageName].stage, rowsLength, rowCurrent).total
    };

    if (!lastProgress || lastProgress.value !== progress.value) {
      process.send({event: 'setProgress', data: progress});
      lastProgress = progress;
    }
  }
}

function getDataSets() {
  return db.DataSet.findAll({
    where: {},
    raw: true
  });
}

function getDataSetValues(dataSets, time) {
  const sendProgress = getProgress('getDataSetValues', dataSets.length);
  let count = 0;

  sendProgress(0);

  return Promise.map(dataSets, (dataSet) => {
    return db.DataSetValue.findAll({
      where: {
        dataSetId: dataSet.id,
        time: {
          $between: time.map(item => moment(item).format(db.formatTime))
        }
      },
      raw: true
    }).then((result) => {
      sendProgress(count++);
      return result;
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

  const sendProgress = getProgress('prepareData', data.dataSets.length);
  data.dataSets.forEach((dataSet, dataSetKey) => {
    dataSet.style = JSON.parse(dataSet.style);
    result.dataSets[dataSet.id] = dataSet;
    result.dataSetValues[dataSet.id] = data.dataSetValues[dataSetKey];

    sendProgress(dataSetKey);
  });

  return result;
}
