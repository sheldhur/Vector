import childProcess from '../lib/childProcess';
import resourcePath from '../lib/resourcePath';
import {WORKER_PATH, IS_PROD} from '../constants/app';
import * as types from '../constants/dataSetImport';

let worker;


export function showModal(payload) {
  return {
    type: types.SHOW_MODAL,
    payload
  };
}

export function setProgressBar(payload) {
  return {
    type: types.PROGRESS_BAR,
    payload
  };
}

export function setCurrentFile(payload) {
  return {
    type: types.CURRENT_FILE,
    payload
  };
}

export function setImportLog(payload) {
  return {
    type: types.IMPORT_LOG,
    payload
  };
}

export function openModal() {
  return (dispatch) => {
    dispatch(showModal(true));
  }
}

export function closeModal() {
  return (dispatch) => {
    if (worker) {
      worker.kill();
    }
    dispatch(showModal(false));
  }
}

export function importDataSet(filePaths, fileType) {
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
          case 'setCurrentFile':
            dispatch(setCurrentFile(response.filePath));
            break;
          case 'setProgress':
            dispatch(setProgressBar(response.progress));
            break;
          case 'setImportLog':
            dispatch(setImportLog(response.data));
            break;
          default:
            console.log(response);
            break;
        }
      }
    });

    worker.send({worker: 'dataSetImport', main, filePaths, fileType}, () => {
      //dispatch(setDataLoading());
    });
  }
}

