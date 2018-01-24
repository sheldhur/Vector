import { ipcRenderer, remote } from 'electron';
import * as fs from 'fs';
import * as dataSetActions from './actions/dataSet';
import * as mainActions from './actions/main';
import * as stationActions from './actions/station';
import { IS_PROD } from './constants/app';


export default (store, history) => {
  const currentWin = remote.getCurrentWindow();

  const openDb = remote.process.argv[1] || null;
  if (openDb && fs.existsSync(openDb) && IS_PROD && currentWin.id === 1) {
    store.dispatch(mainActions.openDataBase(openDb, true));
  } else {
    store.dispatch(mainActions.getLastDataBase(currentWin.id === 1 && window.location.hash === '#/'));
  }

  ipcRenderer.on('dispatchFromMain', (event, msg) => {
    if (msg.push) {
      history.push(msg.push);
    } else if (msg.update) {
      store.dispatch(mainActions.setUpdate(msg.update));
    } else if (msg.action) {
      if (msg.action === 'getLastDataBase') {
        store.dispatch(mainActions.getLastDataBase(false));
      } else if (msg.action === 'getData') {
        store.dispatch(stationActions.getLatitudeAvgValues());
        store.dispatch(dataSetActions.getData());
      } else if (msg.action === 'openDataBase') {
        store.dispatch(mainActions.dialogOpenCreateDataBase());
      } else if (msg.action === 'closeWindow') {
        currentWin.close();
      }
    }
  });

  ipcRenderer.on('windowManger', (event, msg) => {
    if (msg.push) {
      history.push(msg.push);
    }
  });
};
