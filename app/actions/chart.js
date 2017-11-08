import * as types from './../constants/chart';
import './../utils/helper';

export function setChartCurrentTime(payload) {
  if (Object.prototype.toString.call(payload) === '[object Date]') {
    payload = payload.getTime();
  }

  return {
    type: types.CHART_CURRENT_TIME,
    payload,
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

export function shiftChartCurrentTime (value) {
  return (dispatch, getState) => {
    let {time} = getState().main.settings.project;
    let {chartCurrentTime} = getState().chart;

    let timeStart = new Date(time.selected.start);
    let timeEnd = new Date(time.selected.end);

    let timeCurrent = chartCurrentTime ? new Date(chartCurrentTime) : timeStart;

    let timeNew = timeStart;
    if (timeCurrent) {
      timeNew = new Date(timeCurrent.valueOf() + (getAvgTime(time.avg) * value));
      if (timeNew.valueOf() < timeStart.valueOf()) {
        timeNew = timeEnd;
      } else if (timeNew.valueOf() > timeEnd.valueOf()) {
        timeNew = timeStart;
      }
    }

    dispatch(setChartCurrentTime(timeNew));
  };
}

function getAvgTime(timeAvg) {
  return (timeAvg.by.startsWith('min') ? timeAvg.value * 60 : timeAvg.value) * 1000; //ms
}
