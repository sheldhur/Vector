import * as types from '../constants/ui';

const initialState = {
  chartCurrentTime: null,
  chartTooltipTime: null,
  mapTooltipStation: null,
  gridSelectedRows: [],
};

export default function chart(state = initialState, action) {
  switch (action.type) {
    case types.CHART_CURRENT_TIME:
      return {...state, chartCurrentTime: action.payload};
    case types.CHART_TOOLTIP_TIME:
      return {...state, chartTooltipTime: action.payload};
    case types.MAP_TOOLTIP_STATION:
      return {...state, mapTooltipStation: action.payload};
    case types.GRID_SELECTED_ROWS:
      return {...state, gridSelectedRows: action.payload || []};
    default:
      return state;
  }
}
