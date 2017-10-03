import {remote, screen} from 'electron';
import childProcess from '../lib/childProcess';
import {db} from './../database/dbConnect';
import resourcePath from './../lib/resourcePath';
import {WORKER_PATH, IS_PROD} from './../constants/app';
import * as types from './../constants/dataSet';

let worker;
let windowDataSet;

export function setData(payload) {
  return {
    type: types.DATA,
    ...payload,
    syncState: true
  };
}

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
      }, (data) => {
        if (data) {
          console.timeEnd('dataSetWorker');
          switch (data.event) {
            case 'setData':
              dispatch(setData(data.result));
              break;
            case 'setError':
              dispatch(setError(data.error));
              break;
            default:
              console.log(data);
              break;
          }
        }
      });
    }

    worker.send({worker: 'dataSet', main}, () => {
      dispatch(setLoading());
      console.time('dataSetWorker');
    });
  }
}

export function updateDataSet(id, fields, callback) {
  return (dispatch) => {
    let result;

    db.DataSet
      .update(fields, {where: {id}})
      .then((res) => result = res)
      .then(() => db.DataSet.find({where: {id}}))
      .then((dataSet) => dispatch(_updateDataSet(id, dataSet.get({plain: true}))))
      .then(() => callback ? callback({result}) : result)
      .catch((error) => {
        if (callback) {
          callback({error})
        }
        throw error;
      });
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
  return (dispatch, getState) => {
    dispatch(setLoading());
    db.DataSet
      .findAll({attributes: ['id'], where: fields})
      .then((dataSets) => dataSets.map((dataSet) => dataSet.id))
      .then((dataSetIds) => {
        return Promise.all([
          db.DataSetValue.destroy({where: {dataSetId: dataSetIds}}),
          db.DataSet.destroy({where: {id: dataSetIds}})
        ]).then(() => dataSetIds);
      })
      .then((dataSetIds) => {
        dispatch(_deleteDataSet(dataSetIds));
        dispatch(setLoading(false));
      });
  }
}

function _deleteDataSet(dataSetIds) {
  return (dispatch, getState) => {
    const {dataSets, dataSetValues} = getState().dataSet;

    let data = {
      dataSets: {...dataSets},
      dataSetValues: {...dataSetValues}
    };

    dataSetIds.forEach((dataSetId) => {
      for (let dataKey in data) {
        data[dataKey][dataSetId] = undefined;
      }
    });

    dispatch(setData(data));
  }
}

export function updateDataSetValue(id, fields, callback) {
  return (dispatch) => {
    let result;

    db.DataSetValue
      .update(fields, {where: {id}})
      .then((res) => result = res)
      .then(() => db.DataSetValue.find({where: {id}}))
      .then((dataSetValue) => dispatch(_updateDataSetValue(id, dataSetValue.get({plain: true}))))
      .then(() => callback ? callback({result}) : result)
      .catch((error) => {
        if (callback) {
          callback({error})
        }
        throw error;
      });
  }
}

function _updateDataSetValue(id, fields) {
  return (dispatch, getState) => {
    const {dataSets, dataSetValues} = getState().dataSet;

    let data = {
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

export function openWindowDataSet(id) {
  return () => {
    let url = '/dataSet';
    if (id) {
      url += `/${id}`;
    }

    const {width, height} = screen.getPrimaryDisplay().workAreaSize;
    const windowOptions = {
      minWidth: 800,
      minHeight: 600,
      width: Math.floor((width / 100) * 65),
      height: Math.floor((height / 100) * 65),
      // modal: true,
      // parent: remote.getCurrentWindow(),
      backgroundColor: '#292829',
      title: 'Data series',
      icon: resourcePath('./assets/icons/line-chart.png'),
      webPreferences: {
        devTools: true,
      }
    };

    if (!windowDataSet) {
      windowDataSet = new remote.BrowserWindow(windowOptions);
      windowDataSet.setMenu(null);
      windowDataSet.on('closed', () => {
        windowDataSet = null;
      });
      windowDataSet.on('page-title-updated', (e, title) => {
        if (title !== windowOptions.title) {
          e.preventDefault();
          windowDataSet.setTitle(windowOptions.title);
        }
      });
      windowDataSet.once('ready-to-show', () => {
        windowDataSet.show();
      });
      windowDataSet.loadURL(`${window.location.origin + window.location.pathname}#` + url);
    } else {
      windowDataSet.webContents.send('dispatchFromMain', {push: url});
      windowDataSet.show();
    }
  }
}
