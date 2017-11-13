import deepAssign from './../lib/deepAssign';
import moment from 'moment';
import {DEFAULT_SETTINGS} from './../constants/app';
import * as types from './../constants/main';


const initialState = {
  settings: {...DEFAULT_SETTINGS},
  isLoading: false,
  isError: false,
  dbPath: null,
  update: null
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.SETTINGS:
      let settings = deepAssign({...DEFAULT_SETTINGS}, {...action.payload}, (destination, source) => {
        return source.length > 0 ? source : destination;
      });

      settings.project.time.period.start = moment(settings.project.time.period.start);
      settings.project.time.period.end = moment(settings.project.time.period.end);
      settings.project.time.selected.start = moment(settings.project.time.selected.start);
      settings.project.time.selected.end = moment(settings.project.time.selected.end);

      return {...state, settings, isError: false, isLoading: false};
    case types.LOADING:
      return {...state, isLoading: action.payload};
    case types.ERROR:
      return {...state, isError: action.payload, isLoading: false};
    case types.UPDATE:
      return {...state, update: action.payload};
    case types.DB_PATH:
      return {...state, dbPath: action.payload};
    default:
      return state;
  }
}
