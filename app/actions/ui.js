import * as types from '../constants/ui';

export function setChartCurrentTime(payload) {
  const isDate = Object.prototype.toString.call(payload) === '[object Date]';

  return {
    type: types.CHART_CURRENT_TIME,
    payload: isDate ? payload.getTime() : payload,
    syncState: true,
  };
}

export function setChartTooltipTime(payload) {
  return {
    type: types.CHART_TOOLTIP_TIME,
    payload
  };
}

export function setMapTooltipStation(payload) {
  return {
    type: types.MAP_TOOLTIP_STATION,
    payload
  };
}

export function shiftChartCurrentTime(value) {
  return (dispatch, getState) => {
    const {projectTimeSelected, projectTimeAvg} = getState().main.settings;
    const {chartCurrentTime} = getState().ui;

    const timeStart = new Date(projectTimeSelected[0]);
    const timeEnd = new Date(projectTimeSelected[1]);
    const timeAvg = (projectTimeAvg.by.startsWith('min') ? projectTimeAvg.value * 60 : projectTimeAvg.value) * 1000;

    let timeCurrent = chartCurrentTime ? new Date(chartCurrentTime) : timeStart;

    let timeNew = timeStart;
    if (timeCurrent) {
      timeNew = new Date(timeCurrent.valueOf() + (timeAvg * value));
      if (timeNew.valueOf() < timeStart.valueOf()) {
        timeNew = timeEnd;
      } else if (timeNew.valueOf() > timeEnd.valueOf()) {
        timeNew = timeStart;
      }
    }

    dispatch(setChartCurrentTime(timeNew));
  };
}

export function setGridSelectedRows(payload) {
  return {
    type: types.GRID_SELECTED_ROWS,
    payload,
  }
}
