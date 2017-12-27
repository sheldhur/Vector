// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import main from './main';
import ui from './ui';
import dataSet from './dataSet';
import station from './station';
import magnetopause from './magnetopause';

const rootReducer = combineReducers({
  router,
  main,
  ui,
  dataSet,
  station,
  magnetopause,
});

export default rootReducer;
