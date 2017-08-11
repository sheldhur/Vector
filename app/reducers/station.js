import * as types from './../constants/station';

const initialState = {
  stations: null,
  extremes: null,
  stationsValue: null,
  stationView: {
    values: null,
    isLoading: false,
    isError: false,
  },
  latitudeAvgValues: null,
  maximum: {
    dH: 0,
    dD: 0,
    dZ: 0,
  },
  isLoading: false,
  isError: false,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.LATITUDE_AVG_VALUES:
      return {...state, latitudeAvgValues: action.latitudeAvgValues, maximum: action.maximum, isError: false, isLoading: false};
    case types.STATIONS:
      return {...state, stations: action.stations, extremes: action.extremes};
    case types.LOADING:
      return {...state, isLoading: action.payload};
    case types.STATIONS_VALUE:
      return {...state, stationsValue: action.payload};
    case types.STATION_VIEW_VALUES:
      return {...state, stationView: {values: action.payload, isError: false, isLoading: false}};
    case types.STATION_VIEW_ERROR:
      return {...state, stationView: {values: null, isError: action.payload, isLoading: false}};
    case types.STATION_VIEW_LOADING:
      return {...state, stationView: {isLoading: true}};
    case types.ERROR:
      return {
        ...state,
        stations: null,
        extremes: null,
        stationsValue: null,
        avg: null,
        maximum: {
          dH: 0,
          dD: 0,
          dZ: 0,
        },
        isError: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}
