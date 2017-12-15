import {applyMiddleware, compose, createStore} from "redux";
import {hashHistory} from "react-router";
import {push, routerMiddleware} from "react-router-redux";
import {electronEnhancer} from "redux-electron-store";
import {ipcRenderer} from "electron";
import thunk from "redux-thunk";
import {createLogger} from "redux-logger";
import rootReducer from "./../reducers";


const actionCreators = {
  push,
};

const logger = createLogger({
  level: 'info',
  collapsed: true,
  predicate: (getState, action) => !action.type.endsWith('/PROGRESS')
});

const router = routerMiddleware(hashHistory);

// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    // Options: http://extension.remotedev.io/docs/API/Arguments.html
    actionCreators,
  }) :
  compose;
/* eslint-enable no-underscore-dangle */
const enhancer = composeEnhancers(
  applyMiddleware(thunk, router, logger),
  electronEnhancer({
    actionFilter: (action) => {
      if (action.syncState === true) {
        return true;
      }
      return false;
    }
  })
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('./../reducers', () => {
        ipcRenderer.sendSync('renderer-reload');
        store.replaceReducer(require('./../reducers')); // eslint-disable-line global-require
      }
    );
  }

  return store;
}
