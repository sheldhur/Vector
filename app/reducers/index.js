// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import main from './main';
import chart from './chart';
import dataSet from './dataSet';
import dataSetImport from './dataSetImport';
import stationImport from './stationImport';
import station from './station';

const rootReducer = combineReducers({
  routing,
  main,
  chart,
  dataSet,
  dataSetImport,
  stationImport,
  station,
});

export default rootReducer;
