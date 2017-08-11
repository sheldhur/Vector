import childProcess from '../lib/childProcess';
import resourcePath from './../lib/resourcePath';
import {WORKER_PATH, IS_PROD} from './../constants/app';
import * as types from './../constants/stationImport';
import * as stationTypes from './../constants/station';


let worker;

export function showModal(value) {
  return {
    type: types.SHOW_MODAL,
    payload: value
  };
}

export function setProgressBar(payload) {
  return {
    type: types.PROGRESS_BAR,
    payload
  };
}

export function setCurrentFile(value) {
  return {
    type: types.CURRENT_FILE,
    payload: value
  };
}

export function addStation(station) {
  return (dispatch, getState) => {
    let {stations, extremes} = getState().station;

    if (stations[station.id] === undefined) {
      let stationsNew = {...stations, [station.id]: station};

      dispatch({
        type: stationTypes.STATIONS,
        stations: stationsNew,
        extremes
      });
    }
  }
}

export function openModal() {
  return (dispatch) => {
    dispatch(showModal(true));
    dispatch(setProgressBar());
    dispatch(setCurrentFile(''));
  }
}

export function closeModal() {
  return (dispatch) => {
    if (worker) {
      worker.kill();
    }
    dispatch(showModal(false));
    dispatch(setProgressBar());
    dispatch(setCurrentFile(''));
  }
}

export function importStations(filePaths, fileType) {
  return (dispatch, getState) => {
    const {main} = getState();

    worker = childProcess({
      script: resourcePath(WORKER_PATH),
      args: IS_PROD ? ['--max-old-space-size=8192'] : ['-r', 'babel-register', '-r', 'babel-register', '--max-old-space-size=8192'],
      killOnDisconnect: false,
      options: {
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: true
        }
      }
    }, (response) => {
      if (response) {
        switch (response.event) {
          case 'addStation':
            dispatch(addStation(response.value));
            break;
          case 'setCurrentFile':
            dispatch(setCurrentFile(response.filePath));
            break;
          case 'setProgress':
            dispatch(setProgressBar(response.progress));
            break;
          default:
            console.log(response);
            break;
        }
      }
    });

    worker.send({worker: 'stationImport', main, filePaths, fileType}, () => {
      //dispatch(setDataLoading());
    });
  }
}

