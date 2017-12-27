import * as types from '../constants/magnetopause';
import MagnetopausePoint from '../lib/geopack/magnetopausePoint';

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

function prepareDataSet(dataSets, dataSetValues, field) {
  let data;

  if (field && dataSets.hasOwnProperty(field) && dataSetValues.hasOwnProperty(field)) {
    data = {};
    dataSetValues[field].forEach((item) => {
      data[item.time] = !dataSets[field].badValue || item.value < dataSets[field].badValue ? item.value : null;
    });
  }

  return data;
}

export function calculateMagnetopause() {
  return (dispatch, getState) => {
    const field = getState().main.settings.projectMagnetopause;
    const { dataSets, dataSetValues } = getState().dataSet;

    let chartPoints = null;
    let data = null;

    if (dataSetValues && field) {
      const fieldData = {
        b: prepareDataSet(dataSets, dataSetValues, field.b),
        bz: prepareDataSet(dataSets, dataSetValues, field.bz),
        pressureSolar: prepareDataSet(dataSets, dataSetValues, field.pressureSolar),
      };

      if (fieldData.b && fieldData.bz && fieldData.pressureSolar) {
        for (const timeStr in fieldData.b) {
          const time = new Date(timeStr);
          const values = {
            b: fieldData.b[timeStr],
            bz: fieldData.bz[timeStr],
            pressureSolar: fieldData.pressureSolar[timeStr],
            time: new Date(time - (time.getTimezoneOffset() * 60000))
          };
          const point = new MagnetopausePoint(values).calculate(0, 0);

          if (!chartPoints) {
            chartPoints = [];
            data = {};
          }

          chartPoints.push({
            time,
            value: point ? point.toCartesian().x : null,
          });

          data[time.valueOf()] = values;
        }
      }
    }

    dispatch(setChart(chartPoints));
    dispatch(setData(data));
  };
}
