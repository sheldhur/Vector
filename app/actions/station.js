import {remote, screen} from 'electron';
import childProcess from '../lib/childProcess';
import {db} from './../database/dbConnect';
import resourcePath from './../lib/resourcePath';
import {WORKER_PATH, IS_PROD} from './../constants/app';
import * as types from './../constants/station';

let worker;
let windowStation;


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

export function setLatitudeAvgValues(payload) {
  return {
    type: types.LATITUDE_AVG_VALUES,
    ...payload,
    syncState: true
  }
}

export function setStationsValue(payload) {
  return {
    type: types.STATIONS_VALUE,
    payload,
  }
}

export function setStations(payload) {
  return {
    type: types.STATIONS,
    ...payload,
    syncState: true
  }
}

export function setStationViewValues(payload) {
  return {
    type: types.STATION_VIEW_VALUES,
    payload,
  }
}

export function setStationViewError(payload) {
  return {
    type: types.STATION_VIEW_ERROR,
    payload,
  }
}

export function setStationViewLoading() {
  return {
    type: types.STATION_VIEW_LOADING,
  };
}

export function getData(dispatch, getState, action, args) {
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
        console.timeEnd('stationWorker');
        switch (response.event) {
          case 'setStations':
            dispatch(setStations(response.data));
            break;
          case 'setLatitudeAvgValues':
            dispatch(setLatitudeAvgValues(response.data));
            break;
          case 'setError':
            dispatch(setError(response.data));
            break;
          case 'setStationsValue':
            dispatch(setStationsValue(response.data));
            break;
          case 'setStationViewValues':
            dispatch(setStationViewValues(response.data));
            break;
          case 'getStationViewError':
            dispatch(setStationViewError(response.data));
            break;
          default:
            console.log(response);
            break;
        }
      }
    });
  }

  worker.send({worker: 'station', action, main, args}, () => {
    console.time('stationWorker');
  });
}

export function getLatitudeAvgValues() {
  return (dispatch, getState) => {
    dispatch(setLoading());
    getData(dispatch, getState, 'getLatitudeAvgValues');
  };
}

export function getStationsValue() {
  return (dispatch, getState) => {
    const {chartCurrentTime} = getState().chart;
    return getData(dispatch, getState, 'getStationsValue', {currentTime: chartCurrentTime});
  }
}

export function getStationViewValues(args) {
  return (dispatch, getState) => {
    dispatch(setStationViewLoading());
    return getData(dispatch, getState, 'getStationViewValues', args);
  }
}

export function updateStation(id, fields, callback) {
  return (dispatch) => {
    let result;

    db.Station
      .update(fields, {where: {id}})
      .then((res) => result = res)
      .then(() => db.Station.find({where: {id}}))
      .then((stationValue) => dispatch(_updateStation(id, stationValue.get({plain: true}))))
      .then(() => callback ? callback({result}) : result)
      .catch((error) => {
        if (callback) {
          callback({error})
        }
        throw error;
      });
  };
}

function _updateStation(id, fields) {
  return (dispatch, getState) => {
    let {stations, extremes} = getState().station;
    let data = {
      stations: {
        ...stations,
        [id]: {...stations[id], ...fields}
      },
      extremes
    };
    dispatch(setStations(data));
  };
}

export function updateStationValue(id, fields, callback) {
  return (dispatch) => {
    let result;

    db.StationValue
      .update(fields, {where: {id}})
      .then((res) => result = res)
      .then(() => db.StationValue.find({where: {id}}))
      .then((stationValue) => dispatch(_updateStationValue(id, stationValue.get({plain: true}))))
      .then(() => callback ? callback({result}) : result)
      .catch((error) => {
        if (callback) {
          callback({error})
        }
        throw error;
      });
  }
}

function _updateStationValue(id, fields) {
  return (dispatch, getState) => {
    let stationValues = getState().station.stationView.values;
    stationValues = [...stationValues].map((value) => {
      if (value.id === id) {
        return {...value, ...fields}
      }
      return value;
    });

    dispatch(setStationViewValues(stationValues));
  }
}

export function deleteStation(fields) {
  return (dispatch, getState) => {
    dispatch(setLoading());
    db.Station
      .findAll({attributes: ['id'], where: fields})
      .then((stations) => stations.map((station) => station.id))
      .then((stationIds) => {
        return Promise.all([
          db.StationValue.destroy({where: {stationId: stationIds}}),
          db.Station.destroy({where: {id: stationIds}})
        ]).then(() => stationIds);
      })
      .then((stationIds) => {
        dispatch(_deleteStation(stationIds));
        dispatch(setLoading(false));
      });
  }
}

function _deleteStation(stationIds) {
  return (dispatch, getState) => {
    let {stations, extremes} = getState().station;

    let data = {
      stations: {...stations},
      extremes: {...extremes},
    };

    stationIds.forEach((stationId) => {
      for (let dataKey in data) {
        data[dataKey][stationId] = undefined;
      }
    });

    dispatch(setStations(data));
  }
}

export function openWindowStation(id) {
  return () => {
    let url = '/station';
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
      title: 'Stations',
      icon: resourcePath('./assets/icons/radar.png'),
      webPreferences: {
        devTools: true,
      }
    };

    if (!windowStation) {
      windowStation = new remote.BrowserWindow(windowOptions);
      windowStation.setMenu(null);
      windowStation.on('closed', () => {
        windowStation = null;
        getLatitudeAvgValues();
      });
      windowStation.on('page-title-updated', (e, title) => {
        if (title !== windowOptions.title) {
          e.preventDefault();
          windowStation.setTitle(windowOptions.title);
        }
      });
      windowStation.once('ready-to-show', () => {
        windowStation.show();
      });
      windowStation.loadURL(`${window.location.origin + window.location.pathname}#` + url);
    } else {
      windowStation.webContents.send('dispatchFromMain', {push: url});
      windowStation.show();
    }
  }
}
