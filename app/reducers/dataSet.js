import * as types from '../constants/dataSet';

const initialState = {
  dataSets: null,
  dataSetValues: null,
  isLoading: false,
  isError: false,
  progress: {
    title: null,
    value: 0
  },
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.DATA:
      return {...state, dataSets: action.dataSets, dataSetValues: action.dataSetValues, isError: false, isLoading: false, progress: {...initialState.progress}};
    case types.ERROR:
      return {...state, dataSets: null, dataSetValues: null, isError: action.payload, isLoading: false};
    case types.LOADING:
      return {...state, isLoading: action.payload, isError: false, progress: {...initialState.progress}};
    case types.PROGRESS:
      return {...state, progress: action.payload};
    default:
      return state;
  }
}
