import * as types from './../constants/dataSetImport';

const initialState = {
  showModal: false,
  progressBar: {
    total: 0,
    current: 0,
  },
  currentFile: '',
}

export default function main(state = initialState, action) {
  switch (action.type) {
    case types.SHOW_MODAL:
      return {...state, showModal: action.payload};
    case types.PROGRESS_BAR:
      let progressBar = action.payload || initialState.progressBar;
      return {...state, progressBar};
    case types.CURRENT_FILE:
      return {...state, currentFile: action.payload};
    default:
      return state;
  }
}
