import * as types from '../constants/station';

const initialState = {
  stations: null,
  extremes: null,
  stationsValue: null,
  stationView: {
    values: null,
    isLoading: false,
    isError: false,
    progress: {
      title: null,
      value: 0
    },
  },
  latitudeAvgValues: null,
  maximum: {
    dH: 0,
    dD: 0,
    dZ: 0,
  },
  isLoading: false,
  isError: false,
  progress: {
    title: null,
    value: 0
  },
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.LATITUDE_AVG_VALUES:
      return {
        ...state,
        latitudeAvgValues: action.latitudeAvgValues,
        maximum: action.maximum,
        isError: false,
        isLoading: false,
        progress: { ...initialState.progress }
      };
    case types.STATIONS:
      return { ...state, stations: action.stations, extremes: action.extremes };
    case types.LOADING:
      return {
        ...state, isLoading: action.payload, isError: false, progress: { ...initialState.progress }
      };
    case types.PROGRESS:
      return { ...state, progress: action.payload };
    case types.STATIONS_VALUE:
      return { ...state, stationsValue: action.payload };
    case types.STATION_VIEW_VALUES:
      return {
        ...state,
        stationView: {
          ...state.stationView,
          values: action.payload,
          isError: false,
          isLoading: false,
          progress: { ...initialState.stationView.progress }
        }
      };
    case types.STATION_VIEW_ERROR:
      return {
        ...state,
        stationView: {
          ...state.stationView, values: null, isError: action.payload, isLoading: false
        }
      };
    case types.STATION_VIEW_LOADING:
      return {
        ...state,
        stationView: {
          ...state.stationView,
          isLoading: action.payload,
          isError: false,
          progress: { ...initialState.progress }
        }
      };
    case types.STATION_VIEW_PROGRESS:
      return { ...state, stationView: { ...state.stationView, progress: action.payload } };
    case types.RESET: {
      return {
        ...state,
        stations: null,
        extremes: null,
        stationsValue: null,
        latitudeAvgValues: null,
        maximum: { ...initialState.maximum },
        isError: false,
        isLoading: false
      };
    }
    case types.ERROR:
      return {
        ...state,
        stations: null,
        extremes: null,
        stationsValue: null,
        latitudeAvgValues: null,
        maximum: { ...initialState.maximum },
        isError: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
}
