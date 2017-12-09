import moment from 'moment';
import {dateToMinutes} from '../utils/helper';

function delta(stationValue, stationExtremum) {
  let result = {};

  result.dX = componentDelta('compX', stationValue, stationExtremum);
  result.dY = componentDelta('compY', stationValue, stationExtremum);
  result.dZ = componentDelta('compZ', stationValue, stationExtremum);
  if (result.dX !== null && result.dY) {
    result.dH = Math.sqrt((result.dX ** 2) + (result.dY ** 2));

    result.dD = Math.acos(result.dY / result.dH);
    if (result.dX < 0) {
      result.dD = result.dD * -1;
    }

    result.vector = {
      X: -1 * result.dH * Math.sin(result.dD + (Math.PI / 2)),
      Y: -1 * result.dH * Math.cos(result.dD + (Math.PI / 2)),
    };
  } else {
    result.dH = null;
    result.dD = null;
    result.vector = {
      X: null,
      Y: null,
    }
  }

  return result;
}

//return DataCurrent[Component] - DataStart[Component] - (DataCurrent.Time.ToMinute() - DataStart.Time.ToMinute()) * (DataEnd[Component] - DataStart[Component]) / (DataEnd.Time.ToMinute() - DataStart.Time.ToMinute());
function componentDelta(compKey, stationValue, stationExtremum) {
  let dataStart = stationExtremum.start[compKey];
  let dataEnd = stationExtremum.end[compKey];

  if (dataStart !== null && dataEnd !== null && stationValue[compKey] !== null) {
    if (typeof stationValue.time === 'string') {
      stationValue.time = moment(stationValue.time).toDate();
    }
    if (typeof dataStart.time === 'string') {
      dataStart.time = moment(dataStart.time).toDate();
    }
    if (typeof dataEnd.time === 'string') {
      dataEnd.time = moment(dataEnd.time).toDate();
    }

    return stationValue[compKey] - dataStart.value - ((dateToMinutes(stationValue.time) - dateToMinutes(dataStart.time)) * (dataEnd.value - dataStart.value) / (dateToMinutes(dataEnd.time) - dateToMinutes(dataStart.time)));
  }

  return null;
}

function longitude(value) {
  return value > 180 ? value - 360 : value;
}


export default {
  BAD_VALUE: 99999,
  delta,
  componentDelta,
  longitude
}
