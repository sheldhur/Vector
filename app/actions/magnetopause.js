import MagnetopausePoint from './../lib/geopack/magnetopausePoint';
import * as types from './../constants/magnetopause';

export function setChart(payload) {
  return {
    type: types.MAGNETOPAUSE_CHART,
    payload,
  };
}

export function setData(payload) {
  return {
    type: types.MAGNETOPAUSE_DATA,
    payload,
  };
}

export function prepareDataSet() {
  return (dispatch, getState) => {
    const field = getState().main.settings.project.magnetopause;
    const {dataSetValues} = getState().dataSet;

    let chartPoints = null;
    let data = null;
    if (dataSetValues && field && field.b && field.bz && field.pressureSolar) {
      chartPoints = [];
      data = {};
      dataSetValues[field.b].forEach((value, i) => {
        let time = new Date(value.time);
        let values = {
          b: dataSetValues[field.b][i].value,
          bz: dataSetValues[field.bz][i].value,
          pressureSolar: dataSetValues[field.pressureSolar][i].value / 10,
          time: new Date(time.getTime() - time.getTimezoneOffset() * 60000)
        };
        let point = new MagnetopausePoint(values).calculate(0, 0).toCartesian();

        chartPoints.push({
          x: time,
          y: point.x
        });

        data[time] = values;
      });
    }

    dispatch(setChart(chartPoints));
    dispatch(setData(data));
  }
}
