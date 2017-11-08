import {ipcRenderer, remote} from 'electron';
import React from 'react';
import {render} from 'react-dom';
import {hashHistory} from 'react-router';
import {AppContainer} from 'react-hot-loader';
import {syncHistoryWithStore, push} from 'react-router-redux';
import Root from './containers/Root';
import configureStore from './store/configureStore';
import {LocaleProvider} from 'antd';
import locale from 'antd/lib/locale-provider/ru_RU';
import * as MainActions from './actions/main';
import * as StationActions from './actions/station';
import * as DataSetActions from './actions/dataSet';
import './app.global.less';
import './app.global.css';


const currentWin = remote.getCurrentWindow();
const store = configureStore();
const history = syncHistoryWithStore(hashHistory, store);

render(
  <LocaleProvider locale={locale}>
    <AppContainer>
      <Root store={store} history={history}/>
    </AppContainer>
  </LocaleProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <LocaleProvider locale={locale}>
        <AppContainer>
          <NextRoot store={store} history={history}/>
        </AppContainer>
      </LocaleProvider>,
      document.getElementById('root')
    );
  });
}

ipcRenderer.on('dispatchFromMain', (event, msg) => {
  if (msg.push) {
    hashHistory.push(msg.push);
  } else if (msg.update) {
    store.dispatch(MainActions.setUpdate(msg.update));
  } else if (msg.action) {
    if (msg.action === 'getLastDataBase') {
      store.dispatch(MainActions.getLastDataBase(false));
    } else if (msg.action === 'getData') {
      store.dispatch(StationActions.getLatitudeAvgValues());
      store.dispatch(DataSetActions.getData());
    } else if (msg.action === 'openDataBase') {
      store.dispatch(MainActions.dialogOpenCreateDataBase());
    } else if (msg.action === 'closeWindow') {
      remote.getCurrentWindow().close();
    }
  }
});

ipcRenderer.on('windowManger', (event, msg) => {
  if (msg.push) {
    hashHistory.push(msg.push);
  }
});

store.dispatch(MainActions.getLastDataBase(currentWin.id === 1 && window.location.hash === '#/'));
