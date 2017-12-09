import * as types from '../constants/stationImport';

const initialState = {
  showModal: false,
  progressBar: {
    total: 0,
    current: 0,
  },
  currentFile: null,
  importLog: [],
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.SHOW_MODAL:
      if (!action.payload) {
        return {...state, ...initialState};
      }
      return {...state, showModal: action.payload};
    case types.PROGRESS_BAR:
      return {...state, progressBar: action.payload};
    case types.CURRENT_FILE:
      return {...state, currentFile: action.payload};
    case types.IMPORT_LOG:
      return {...state, importLog: [...state.importLog, action.payload]};
    default:
      return state;
  }
}
