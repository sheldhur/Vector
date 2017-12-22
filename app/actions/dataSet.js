import {hashHistory} from 'react-router';
import childProcess from '../lib/childProcess';
import resourcePath from '../lib/resourcePath';
import {db} from '../database/dbConnect';
import {WORKER_PATH, IS_PROD} from '../constants/app';
import * as types from '../constants/dataSet';

let worker;

export function setError(payload) {
  return {
    type: types.ERROR,
    payload,
    syncState: true
  }
}

export function setLoading(payload = true) {
  return {
    type: types.LOADING,
    payload,
    syncState: true
  };
}

export function setProgress(payload) {
  return {
    type: types.PROGRESS,
    payload,
    syncState: true
  };
}

export function setData(payload) {
  return {
    type: types.DATA,
    payload,
    syncState: true
  };
}

export function resetDataSet() {
  return {
    type: types.RESET,
    syncState: true
  };
}

export function getData() {
  return (dispatch, getState) => {
    const {main} = getState();

    if (!worker) {
      worker = childProcess({
        script: resourcePath(WORKER_PATH),
        args: IS_PROD ? ['--max-old-space-size=8192'] : ['-r', 'babel-register', '-r', 'babel-register', '--max-old-space-size=8192'],
        killOnDisconnect: false,
        timeout: false,
        options: {
          env: {
            ...process.env,
            ELECTRON_RUN_AS_NODE: true
          }
        }
      }, (response) => {
        if (response) {
          // console.timeEnd('dataSetWorker');
          switch (response.event) {
            case 'setData':
              dispatch(setData(response.data));
              break;
            case 'setError':
              dispatch(setError(response.data));
              break;
            case 'setProgress':
              dispatch(setProgress(response.data));
              break;
            default:
              console.log(response);
              break;
          }
        }
      });
    }

    worker.send({worker: 'dataSet', main}, () => {
      dispatch(setLoading());
      // console.time('dataSetWorker');
    });
  }
}

export function updateDataSet(id, fields, callback) {
  return async (dispatch) => {
    try {
      const result = await db.DataSet.update(fields, {where: {id}});
      const dataSet = await db.DataSet.find({where: {id}});
      dispatch(_updateDataSet(id, dataSet.get({plain: true})));

      if (callback) callback({result});
    } catch (error) {
      if (callback) callback({error});
      throw error;
    }
  }
}

function _updateDataSet(id, fields) {
  return (dispatch, getState) => {
    const {dataSets, dataSetValues} = getState().dataSet;

    let data = {
      dataSets: {
        ...dataSets,
        [id]: {...dataSets[id], ...fields}
      },
      dataSetValues
    };

    dispatch(setData(data));
  }
}

export function deleteDataSet(fields) {
  return async (dispatch) => {
    dispatch(setLoading());

    const dataSets = await db.DataSet.findAll({attributes: ['id'], where: fields});
    const dataSetIds = dataSets.map((dataSet) => dataSet.id);

    openDataSetPage();
    await Promise.all([
      db.DataSetValue.destroy({where: {dataSetId: dataSetIds}}),
      db.DataSet.destroy({where: {id: dataSetIds}})
    ]);

    dispatch(_deleteDataSet(dataSetIds));
    dispatch(setLoading(false));
  }
}

function _deleteDataSet(dataSetIds, dataKeys) {
  return (dispatch, getState) => {
    const {dataSets, dataSetValues} = getState().dataSet;

    const data = {
      dataSets: {...dataSets},
      dataSetValues: {...dataSetValues}
    };

    if (!dataKeys) {
      dataKeys = Object.keys(data);
    } else if (!Array.isArray(dataKeys)) {
      dataKeys = [dataKeys];
    }

    dataSetIds.forEach((dataSetId) => {
      dataKeys.forEach((dataKey) => {
        data[dataKey][dataSetId] = undefined;
      });
    });

    dispatch(setData(data));
  }
}

export function updateDataSetValue(id, fields, callback) {
  return async (dispatch) => {
    try {
      const result = await db.DataSetValue.update(fields, {where: {id}});
      const dataSetValue = await db.DataSetValue.find({where: {id}});
      dispatch(_updateDataSetValue(id, dataSetValue.get({plain: true})));

      if (callback) callback({result});
    } catch (error) {
      if (callback) callback({error});
      throw error;
    }
  }
}

function _updateDataSetValue(id, fields) {
  return (dispatch, getState) => {
    const {dataSets, dataSetValues} = getState().dataSet;

    const data = {
      dataSets,
      dataSetValues: {...dataSetValues}
    };

    data.dataSetValues[fields.dataSetId] = data.dataSetValues[fields.dataSetId].map((dataSetValue) => {
      if (dataSetValue.id === id) {
        return {...dataSetValue, ...fields};
      }

      return dataSetValue;
    });

    dispatch(setData(data));
  }
}

export function deleteDataSetValue(fields) {
  return async (dispatch) => {
    dispatch(setLoading(true));

    let dataSetValuesIds;
    if (!fields.id && !fields.dataSetId) {
      const dataSetValues = await db.DataSetValue.findAll({attributes: ['id'], where: fields});
      dataSetValuesIds = dataSetValues.map((dataSetValue) => dataSetValue.id);
    }
    await db.DataSetValue.destroy({where: fields});

    if (fields.id) {
      dispatch(_deleteDataSetValue(Array.isArray(fields.id) ? fields.id : [fields.id]));
    } else if (fields.dataSetId) {
      dispatch(_deleteDataSet(Array.isArray(fields.dataSetId) ? fields.dataSetId : [fields.dataSetId], 'dataSetValues'));
    } else {
      dispatch(_deleteDataSetValue(dataSetValuesIds));
    }

    dispatch(setLoading(false));
  }
}

function _deleteDataSetValue(dataSetValueIds) {
  return (dispatch, getState) => {
    const {dataSets, dataSetValues} = getState().dataSet;

    const newDataSetValues = {};
    for (const dataSetId in dataSetValues) {
      newDataSetValues[dataSetId] = dataSetValues[dataSetId].filter(value => dataSetValueIds.indexOf(value.id) === -1);
    }

    dispatch(setData({
      dataSets,
      dataSetValues: newDataSetValues
    }));
  }
}

export function deleteSelectedDataSets() {
  return (dispatch, getState) => {
    const {gridSelectedRows} = getState().ui;

    if (gridSelectedRows && gridSelectedRows.length) {
      dispatch(deleteDataSet({
        id: gridSelectedRows.map(item => item.id)
      }))
    }
  }
}

export function deleteSelectedDataSetValues(field) {
  return (dispatch, getState) => {
    const {gridSelectedRows} = getState().ui;

    if (gridSelectedRows && gridSelectedRows.length) {
      dispatch(deleteDataSetValue({
        [field]: gridSelectedRows.map(item => item.id)
      }))
    }
  }
}

export function clearDataSets() {
  return async (dispatch) => {
    dispatch(setLoading(true));

    await Promise.all([
      db.DataSet.destroy({where: {}}),
      db.DataSetValue.destroy({where: {}}),
      db.sequelize.query('DELETE FROM sqlite_sequence WHERE name IN (:name)', {
        replacements: {
          name: [db.DataSet.getTableName(), db.DataSetValue.getTableName()]
        },
        type: db.sequelize.QueryTypes.DELETE
      })
    ]);

    dispatch(resetDataSet());
    dispatch(setLoading(false));
  }
}

function openDataSetPage() {
  if (hashHistory.getCurrentLocation().pathname !== '/dataSet') {
    hashHistory.push('/dataSet');
  }
}
