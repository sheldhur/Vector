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
      const settings = {...DEFAULT_SETTINGS, ...action.payload};
      Object.keys(settings).forEach((key) => {
        const value = settings[key];
        if (key === 'projectTimePeriod' || key === 'projectTimeSelected') {
          settings[key] = value.map(item => moment(item));
        } else if (typeof value === "object") {
          if (!Array.isArray(value)) {
            settings[key] = {...DEFAULT_SETTINGS[key], ...action.payload[key]};
          } else {
            settings[key] = action.payload[key] ? [...action.payload[key]] : [...DEFAULT_SETTINGS[key]];
          }
        }
      });

      return {...state, settings, isError: false, isLoading: false};
    case types.LOADING:
      return {...state, isLoading: action.payload};
    case types.ERROR:
      console.log(action.payload);
      return {...state, isError: action.payload, isLoading: false};
    case types.UPDATE:
      return {...state, update: action.payload};
    case types.DB_PATH:
      return {...state, dbPath: action.payload};
    default:
      return state;
  }
}
