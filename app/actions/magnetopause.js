import MagnetopausePoint from '../lib/geopack/magnetopausePoint';
import * as types from '../constants/magnetopause';

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

function prepareDataSet(dataSetValues, field) {
  let data;

  if (field && dataSetValues.hasOwnProperty(field)) {
    data = {};
    dataSetValues[field].forEach((item) => {
      data[item.time] = item.value;
    });
  }

  return data;
}

export function calculateMagnetopause() {
  return (dispatch, getState) => {
    const field = getState().main.settings.projectMagnetopause;
    const {dataSetValues} = getState().dataSet;

    let chartPoints = null;
    let data = null;

    if (dataSetValues && field) {
      const fieldData = {
        b: prepareDataSet(dataSetValues, field.b),
        bz: prepareDataSet(dataSetValues, field.bz),
        pressureSolar: prepareDataSet(dataSetValues, field.pressureSolar),
      };

      for (let timeStr in fieldData.b) {
        const time = new Date(timeStr);
        let values = {
          b: fieldData.b[timeStr],
          bz: fieldData.bz[timeStr],
          pressureSolar: fieldData.pressureSolar[timeStr],
          time: new Date(time - time.getTimezoneOffset() * 60000)
        };
        let point = new MagnetopausePoint(values).calculate(0, 0);

        if (!chartPoints) {
          chartPoints = [];
          data = {}
        }

        chartPoints.push({
          time,
          value: point ? point.toCartesian().x : null,
        });

        data[time] = values;
      }
    }

    dispatch(setChart(chartPoints));
    dispatch(setData(data));
  }
}
