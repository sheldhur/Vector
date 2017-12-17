import Promise from 'bluebird';
import moment from 'moment';
import errorToObject from '../lib/errorToObject';
import calcProgress from '../lib/calcProgress';

let db;

function getProgress(stageName, rowsLength, throttleMs = 150) {
  let stageLength = 0;
  const stages = {
    getDataSetValues: {stage: stageLength++, message: "Loading datasets values"},
  };

  let lastSendTime = null;

  return (rowCurrent) => {
    const progress = {
      title: stages[stageName].message,
      value: calcProgress(stageLength, stages[stageName].stage, rowsLength, rowCurrent).total
    };

    const sendTime = new Date().valueOf();
    if (!lastSendTime || sendTime - lastSendTime > throttleMs) {
      process.send({event: 'setProgress', data: progress});
      lastSendTime = sendTime;
    }
  }
}

export default function (dbSession, data) {
  if (!data.main.settings) {
    throw new Error("Can't get project settings");
  }

  db = dbSession;

  const {projectTimeSelected} = data.main.settings;
  if (!projectTimeSelected[0] || !projectTimeSelected[1]) {
    throw new Error("Can't get time period");
  }

  (async () => {
    try {
      const dataSets = await getDataSets();
      const result = await getDataSetValues(dataSets, projectTimeSelected);
      process.send({event: 'setData', data: result});
    } catch (error) {
      process.send({event: 'setError', data: errorToObject(error)});
      console.error(error);
    }
  })();
}

function getDataSets() {
  return db.DataSet.findAll({
    where: {},
    raw: true
  });
}

async function getDataSetValues(dataSets, time) {
  const sendProgress = getProgress('getDataSetValues', dataSets.length);
  let count = 0;

  sendProgress(count);

  const result = {
    dataSets: {},
    dataSetValues: {}
  };

  await Promise.map(dataSets, async (dataSet) => {
    result.dataSets[dataSet.id] = {...dataSet, style: JSON.parse(dataSet.style)};
    result.dataSetValues[dataSet.id] = await db.DataSetValue.findAll({
      where: {
        dataSetId: dataSet.id,
        time: {
          $between: time.map(item => moment(item).format(db.formatTime))
        }
      },
      raw: true
    });

    sendProgress(count++);
  });

  return result;
}
