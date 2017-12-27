import * as types from '../constants/ui';

const initialState = {
  chartCurrentTime: null,
  chartTooltipTime: null,
  mapTooltipStation: null,
  gridSelectedRows: [],
  gridLastOpenItem: null,
  importShowModal: false,
  importCurrentFile: null,
  importProgress: {
    total: 0,
    current: 0,
  },
  importLog: [],
};

export default function chart(state = initialState, action) {
  switch (action.type) {
    case types.CHART_CURRENT_TIME:
      return { ...state, chartCurrentTime: action.payload };
    case types.CHART_TOOLTIP_TIME:
      return { ...state, chartTooltipTime: action.payload };
    case types.MAP_TOOLTIP_STATION:
      return { ...state, mapTooltipStation: action.payload };
    case types.GRID_SELECTED_ROWS:
      return { ...state, gridSelectedRows: action.payload || [] };
    case types.GRID_LAST_OPEN_ITEM:
      return { ...state, gridLastOpenItem: action.payload };
    case types.IMPORT_SHOW_MODAL:
      if (!action.payload) {
        return {
          ...state,
          importShowModal: false,
          importCurrentFile: null,
          importProgress: {
            total: 0,
            current: 0,
          },
          importLog: []
        }
      }
      return { ...state, importShowModal: action.payload };
    case types.IMPORT_CURRENT_FILE:
      return { ...state, importCurrentFile: action.payload };
    case types.IMPORT_PROGRESS:
      return { ...state, importProgress: action.payload || { ...initialState.progressBar } };
    case types.IMPORT_LOG:
      return { ...state, importLog: action.payload ? [...state.importLog, action.payload] : [] };
    default:
      return state;
  }
}
