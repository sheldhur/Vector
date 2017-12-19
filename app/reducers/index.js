// @flow
import {combineReducers} from 'redux';
import {routerReducer as routing} from 'react-router-redux';
import main from './main';
import ui from './ui';
import dataSet from './dataSet';
import dataSetImport from './dataSetImport';
import stationImport from './stationImport';
import station from './station';
import magnetopause from './magnetopause';

const rootReducer = combineReducers({
  routing,
  main,
  ui,
  dataSet,
  dataSetImport,
  stationImport,
  station,
  magnetopause,
});

export default rootReducer;
