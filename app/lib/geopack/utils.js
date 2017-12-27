export const R2D = 180 / Math.PI;
export const D2R = 1 / R2D;
export const RE = 6371.2;

export const cartesianToSperical = (values, convert = D2R) => {
  const { x, y, z } = values;

  const altitude = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  const latitude = ((Math.atan2(y, x) * 180 / Math.PI) % 360) / 180 * Math.PI * convert;
  const longitude = Math.acos(z / r) * convert;

  return {
    altitude,
    latitude,
    longitude,
  };
};

export const sphericalToCartesian = (values, convert = D2R) => {
  let latitude;
  let longitude;
  let altitude;

  if (values.hasOwnProperty('latitude') && values.hasOwnProperty('longitude')) {
    latitude = values.latitude;
    longitude = values.longitude;
    altitude = values.hasOwnProperty('altitude') ? values.altitude : 1;
  } else if (values.hasOwnProperty('phi') && values.hasOwnProperty('theta')) {
    latitude = values.phi;
    longitude = values.theta;
    altitude = values.hasOwnProperty('r') ? values.r : 1;
  }

  return {
    x: altitude * Math.cos(latitude * convert) * Math.cos(longitude * convert),
    y: altitude * Math.cos(latitude * convert) * Math.sin(longitude * convert),
    z: altitude * Math.sin(latitude * convert),
  };
};

export class CoordinatesPoint {
  x = null;
  y = null;
  z = null;

  constructor(value) {
    if (value.hasOwnProperty('x') && value.hasOwnProperty('y') && value.hasOwnProperty('z')) {
      this.x = value.x;
      this.y = value.y;
      this.z = value.z;
    } else if (value.hasOwnProperty('latitude') && value.hasOwnProperty('longitude')) {
      // let altitude =
    }
  }

  toSperical = () => {

  };

  toCartesian = () => {

  };
}
