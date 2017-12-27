import { push } from 'react-router-redux';
import { IS_PROD, WORKER_PATH } from '../constants/app';
import * as types from '../constants/station';
import { db } from '../database/dbConnect';
import childProcess from '../lib/childProcess';
import resourcePath from '../lib/resourcePath';

let worker;


export function setError(payload) {
  return {
    type: types.ERROR,
    payload,
    syncState: true
  };
}

export function setLoading(payload) {
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

export function setLatitudeAvgValues(payload) {
  return {
    type: types.LATITUDE_AVG_VALUES,
    ...payload,
    syncState: true
  };
}

export function setStationsValue(payload) {
  return {
    type: types.STATIONS_VALUE,
    payload,
  };
}

export function setStations(payload) {
  return {
    type: types.STATIONS,
    ...payload,
    syncState: true
  };
}

export function setStationViewValues(payload) {
  return {
    type: types.STATION_VIEW_VALUES,
    payload,
  };
}

export function setStationViewError(payload) {
  return {
    type: types.STATION_VIEW_ERROR,
    payload,
  };
}

export function setStationViewLoading(payload) {
  return {
    type: types.STATION_VIEW_LOADING,
    payload
  };
}

export function setStationViewProgress(payload) {
  return {
    type: types.STATION_VIEW_PROGRESS,
    payload,
  };
}

export function resetStation() {
  return {
    type: types.RESET,
    syncState: true
  };
}

export function getData(dispatch, getState, action, args) {
  const { main } = getState();

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
        // console.timeEnd('stationWorker');
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
          case 'setProgress':
            dispatch(setProgress(response.data));
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
          case 'setStationViewProgress':
            dispatch(setStationViewProgress(response.data));
            break;
          default:
            console.log(response);
            break;
        }
      }
    });
  }

  worker.send({
    worker: 'station', action, main, args
  }, () => {
    // console.time('stationWorker');
  });
}

export function getLatitudeAvgValues() {
  return (dispatch, getState) => {
    dispatch(setLoading(true));
    getData(dispatch, getState, 'getLatitudeAvgValues');
  };
}

export function getStationsValue() {
  return (dispatch, getState) => {
    const { chartCurrentTime } = getState().ui;
    return getData(dispatch, getState, 'getStationsValue', { currentTime: chartCurrentTime });
  };
}

export function getStationViewValues(args) {
  return (dispatch, getState) => {
    dispatch(setStationViewValues(null));
    dispatch(setStationViewLoading(true));
    return getData(dispatch, getState, 'getStationViewValues', args);
  };
}

export function updateStation(id, fields, callback) {
  return async (dispatch) => {
    try {
      const result = await db.Station.update(fields, { where: { id } });
      const station = await db.Station.find({ where: { id } });
      dispatch(_updateStation(id, station.get({ plain: true })));

      if (callback) callback({ result });
    } catch (error) {
      if (callback) callback({ error });
      throw error;
    }
  };
}

function _updateStation(id, fields) {
  return (dispatch, getState) => {
    const { stations, extremes } = getState().station;
    const data = {
      stations: {
        ...stations,
        [id]: { ...stations[id], ...fields }
      },
      extremes
    };
    dispatch(setStations(data));
  };
}

export function updateStationValue(id, fields, callback) {
  return async (dispatch) => {
    try {
      const result = await db.StationValue.update(fields, { where: { id } });
      const stationValue = await db.StationValue.find({ where: { id } });
      dispatch(_updateStationValue(id, stationValue.get({ plain: true })));

      if (callback) callback({ result });
    } catch (error) {
      if (callback) callback({ error });
      throw error;
    }
  };
}

function _updateStationValue(id, fields) {
  return (dispatch, getState) => {
    let stationValues = getState().station.stationView.values;
    stationValues = [...stationValues].map((value) => {
      if (value.id === id) {
        return { ...value, ...fields };
      }
      return value;
    });

    dispatch(setStationViewValues(stationValues));
  };
}

export function deleteStation(fields) {
  return async (dispatch) => {
    dispatch(setLoading(true));

    let stationIds;
    if (fields.hasOwnProperty('id') && Object.keys(fields).length === 1) {
      stationIds = Array.isArray(fields.id) ? fields.id : [fields.id];
    } else {
      const stations = await db.Station.findAll({ attributes: ['id'], where: fields });
      stationIds = stations.map((station) => station.id);
    }

    openStationPage();
    await Promise.all([
      db.StationValue.destroy({ where: { stationId: stationIds } }),
      db.Station.destroy({ where: { id: stationIds } })
    ]);

    dispatch(_deleteStation(stationIds));
    dispatch(setLoading(false));
  };
}

function _deleteStation(stationIds) {
  return (dispatch, getState) => {
    const { stations, extremes } = getState().station;
    const data = {
      stations: { ...stations },
      extremes: { ...extremes },
    };

    stationIds.forEach((stationId) => {
      for (const dataKey in data) {
        data[dataKey][stationId] = undefined;
      }
    });

    dispatch(setStations(data));
  };
}

export function deleteStationValue(fields) {
  return async (dispatch) => {
    dispatch(setStationViewLoading(true));

    let stationValueIds;
    if (!fields.id && !fields.stationId) {
      const stationValues = await db.StationValue.findAll({ attributes: ['id'], where: fields });
      stationValueIds = stationValues.map((stationValue) => stationValue.id);
    }
    await db.StationValue.destroy({ where: fields });

    if (fields.id) {
      dispatch(_deleteStationValue(Array.isArray(fields.id) ? fields.id : [fields.id]));
    } else if (fields.stationId) {
      dispatch(setStationViewValues(null));
    } else {
      dispatch(_deleteStationValue(stationValueIds));
    }

    dispatch(setStationViewLoading(false));
  };
}

function _deleteStationValue(stationValueIds) {
  return (dispatch, getState) => {
    const { values } = getState().station.stationView;
    const newValues = values.filter(stationValue => stationValueIds.indexOf(stationValue.id) === -1);

    dispatch(setStationViewValues(newValues));
  };
}

export function deleteSelectedStations() {
  return (dispatch, getState) => {
    const { gridSelectedRows } = getState().ui;

    if (gridSelectedRows && gridSelectedRows.length) {
      dispatch(deleteStation({
        id: gridSelectedRows.map(item => item.id)
      }));
    }
  };
}

export function deleteSelectedStationsValues(field) {
  return (dispatch, getState) => {
    const { gridSelectedRows } = getState().ui;

    if (gridSelectedRows && gridSelectedRows.length) {
      dispatch(deleteStationValue({
        [field]: gridSelectedRows.map(item => item.id)
      }));
    }
  };
}

export function clearStations() {
  return async (dispatch) => {
    dispatch(setLoading(true));

    await Promise.all([
      db.Station.destroy({ where: {} }),
      db.StationValue.destroy({ where: {} }),
      db.sequelize.query('DELETE FROM sqlite_sequence WHERE name IN (:name)', {
        replacements: {
          name: [db.Station.getTableName(), db.StationValue.getTableName()]
        },
        type: db.sequelize.QueryTypes.DELETE
      })
    ]);

    dispatch(resetStation());
    dispatch(setLoading(false));
  };
}

function openStationPage() {
  return (dispatch, getState) => {
    if (getState().router.location.pathname !== '/station') {
      return dispatch(push('/station'));
    }
  };
}
