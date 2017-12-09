// @flow
import {applyMiddleware, compose, createStore} from "redux";
import thunk from 'redux-thunk';
import {hashHistory} from 'react-router';
import {routerMiddleware} from 'react-router-redux';
import {electronEnhancer} from 'redux-electron-store';
import rootReducer from '../reducers/index';

const router = routerMiddleware(hashHistory);

const enhancer = compose(
  applyMiddleware(thunk),
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
  return createStore(rootReducer, initialState, enhancer); // eslint-disable-line
}
