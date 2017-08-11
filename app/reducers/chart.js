import * as types from './../constants/chart';

const initialState = {
  chartCurrentTime: null,
  chartTooltipTime: null,
  mapTooltipStation: null,
};

export default function chart(state = initialState, action) {
  switch (action.type) {
    case types.CHART_CURRENT_TIME:
      return {...state, chartCurrentTime: action.payload};
    case types.CHART_TOOLTIP_TIME:
      return {...state, chartTooltipTime: action.payload};
    case types.MAP_TOOLTIP_STATION:
      return {...state, mapTooltipStation: action.payload};
    default:
      return state;
  }
}
