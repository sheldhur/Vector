import * as types from './../constants/magnetopause';

const initialState = {
  data: null,
  chart: null,
};

export default function magnetopause(state = initialState, action) {
  switch (action.type) {
    case types.MAGNETOPAUSE_DATA:
      return {...state, data: action.payload};
    case types.MAGNETOPAUSE_CHART:
      return {...state, chart: action.payload};
    default:
      return state;
  }
}
