import {ipcMain} from 'electron';
import {electronEnhancer} from 'redux-electron-store';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  // Redux Configuration
  const middleware = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  enhancers.push(applyMiddleware(...middleware));
  enhancers.push(electronEnhancer({
    actionFilter: (action) => {
      if (action.syncState === true) {
        return true;
      }
      return false;
    }
  }));
  const enhancer = compose(...enhancers);

  const store = createStore(rootReducer, initialState, enhancer);

  ipcMain.on('renderer-reload', (event, action) => {
    delete require.cache[require.resolve('../reducers')];
    store.replaceReducer(require('../reducers'));
    event.returnValue = true;
  });

  return store;
}
