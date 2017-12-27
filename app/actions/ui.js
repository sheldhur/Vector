import { IS_PROD, WORKER_PATH } from '../constants/app';
import * as stationTypes from '../constants/station';
import * as types from '../constants/ui';
import childProcess from '../lib/childProcess';
import resourcePath from '../lib/resourcePath';

let worker;


export function setChartCurrentTime(payload) {
  const isDate = Object.prototype.toString.call(payload) === '[object Date]';

  return {
    type: types.CHART_CURRENT_TIME,
    payload: isDate ? payload.getTime() : payload,
    syncState: true,
  };
}

export function setChartTooltipTime(payload) {
  return {
    type: types.CHART_TOOLTIP_TIME,
    payload
  };
}

export function setMapTooltipStation(payload) {
  return {
    type: types.MAP_TOOLTIP_STATION,
    payload
  };
}

export function shiftChartCurrentTime(value) {
  return (dispatch, getState) => {
    const { projectTimeSelected, projectTimeAvg } = getState().main.settings;
    const { chartCurrentTime } = getState().ui;

    const timeStart = new Date(projectTimeSelected[0]);
    const timeEnd = new Date(projectTimeSelected[1]);
    const timeAvg = (projectTimeAvg.by.startsWith('min') ? projectTimeAvg.value * 60 : projectTimeAvg.value) * 1000;

    const timeCurrent = chartCurrentTime ? new Date(chartCurrentTime) : timeStart;

    let timeNew = timeStart;
    if (timeCurrent) {
      timeNew = new Date(timeCurrent.valueOf() + (timeAvg * value));
      if (timeNew.valueOf() < timeStart.valueOf()) {
        timeNew = timeEnd;
      } else if (timeNew.valueOf() > timeEnd.valueOf()) {
        timeNew = timeStart;
      }
    }

    dispatch(setChartCurrentTime(timeNew));
  };
}

export function setGridSelectedRows(payload) {
  return {
    type: types.GRID_SELECTED_ROWS,
    payload,
  };
}

export function setGridLastOpenItem(payload) {
  return {
    type: types.GRID_LAST_OPEN_ITEM,
    payload,
  };
}

export function setImportShowModal(payload) {
  return {
    type: types.IMPORT_SHOW_MODAL,
    payload
  };
}

export function setImportProgress(payload) {
  return {
    type: types.IMPORT_PROGRESS,
    payload
  };
}

export function setImportCurrentFile(payload) {
  return {
    type: types.IMPORT_CURRENT_FILE,
    payload
  };
}

export function setImportLog(payload) {
  return {
    type: types.IMPORT_LOG,
    payload
  };
}

export function importCloseModal() {
  return (dispatch) => {
    if (worker) {
      worker.kill();
    }
    dispatch(setImportShowModal(false));
  };
}

export function addStation(station) {
  return (dispatch, getState) => {
    const { stations, extremes } = getState().station;

    if (stations[station.id] === undefined) {
      const stationsNew = { ...stations, [station.id]: station };

      dispatch({
        type: stationTypes.STATIONS,
        stations: stationsNew,
        extremes
      });
    }
  };
}

export function importFiles(workerName, filePaths, fileType) {
  return (dispatch, getState) => {
    const { main } = getState();

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
            dispatch(addStation(response.data));
            break;
          case 'setCurrentFile':
            dispatch(setImportCurrentFile(response.data));
            break;
          case 'setProgress':
            dispatch(setImportProgress(response.data));
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

    worker.send({
      worker: workerName, main, filePaths, fileType
    }, () => {
      dispatch(setImportShowModal(true));
    });
  };
}

export function importStations(filePaths, fileType) {
  return importFiles('stationImport', filePaths, fileType);
}

export function importDataSets(filePaths, fileType) {
  return importFiles('dataSetImport', filePaths, fileType);
}
