import deepAssign from './../lib/deepAssign';
import moment from 'moment';
import {DEFAULT_SETTINGS} from './../constants/app';
import * as types from './../constants/main';


const initialState = {
  settings: {...DEFAULT_SETTINGS},
  error: null,
  dbPath: null,
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

      return {...state, settings};
    case types.ERROR:
      return {...state, error: action.payload};
    case types.DB_PATH:
      return {...state, dbPath: action.payload};
    default:
      return state;
  }
}
