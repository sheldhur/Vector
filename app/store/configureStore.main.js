import { createStore, applyMiddleware, compose } from 'redux';
import { hashHistory } from 'react-router';
import { routerMiddleware, push } from 'react-router-redux';
import { electronEnhancer } from 'redux-electron-store';
import { ipcMain } from 'electron';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

const router = routerMiddleware(hashHistory);

let enhancer = compose(
  applyMiddleware(thunk, router),
  electronEnhancer({})
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  ipcMain.on('renderer-reload', (event, action) => {
    delete require.cache[require.resolve('../reducers')];
    store.replaceReducer(require('../reducers'));
    event.returnValue = true;
  });

  return store;
}
