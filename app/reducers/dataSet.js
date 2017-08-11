import * as types from './../constants/dataSet';

const initialState = {
  // chart: null,
  dataSets: null,
  dataSetValues: null,
  isLoading: false,
  isError: false,
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.DATA:
      return {...state, dataSets: action.dataSets, dataSetValues: action.dataSetValues, isError: false, isLoading: false};
    case types.ERROR:
      return {...state, dataSets: null, dataSetValues: null, isError: action.payload, isLoading: false};
    case types.LOADING:
      return {...state, isLoading: action.payload};
    default:
      return state;
  }
}
