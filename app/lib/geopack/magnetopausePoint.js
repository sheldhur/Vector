import { dipoleTiltAngle } from './igrf';

const M2R = Math.PI / 180;
const A = [
  12.544,
  -0.194,
  0.305,
  0.0573,
  2.178,
  0.0571,
  -0.999,
  16.473,
  0.00152,
  0.382,
  0.0431,
  -0.00763,
  -0.210,
  0.0405,
  -4.430,
  -0.636,
  -2.600,
  0.832,
  -5.328,
  1.103,
  -0.907,
  1.450,
];

export default class MagnetopausePoint {
  bz = null;
  pressureSolar = null;
  pressureMagnetic = null;
  dipoleTilt = null;

  constructor(props) {
    for (const name in this) {
      if (props.hasOwnProperty(name) && props[name] != null) {
        this[name] = props[name];
      }
    }

    if (props.hasOwnProperty('b')) {
      this.pressureMagnetic = 3.978874E-04 * props.b ** 2;
    } else if (props.hasOwnProperty('time')) {
      this.dipoleTilt = dipoleTiltAngle(props.time);
    }
  }

  calculate(latitude, longitude) {
    const {
      bz, pressureSolar, pressureMagnetic, dipoleTilt
    } = this;
    const dipoleTiltRad = dipoleTilt * M2R;
    const latitudeRad = latitude * M2R;
    const longitudeRad = longitude * M2R;

    if (pressureMagnetic > 0 && pressureSolar > 0 && bz > -200) {
      let te = Math.cos(latitudeRad) * Math.cos(longitudeRad);
      if (te > 1) {
        te = 1;
      } else if (te < -1) {
        te = -1;
      }
      te = Math.acos(te);

      let fi = Math.pow(Math.sin(latitudeRad), 2) + Math.pow(Math.cos(latitudeRad) * Math.sin(longitudeRad), 2);
      if (fi > 0) {
        if (fi > 1) {
          fi = 1;
        } else if (fi < -1) {
          fi = -1;
        }
        fi = Math.acos(fi);
      }
      if (Math.sin(latitudeRad) < 0) {
        fi = -1 * fi;
      }

      const en = A[21];
      const es = A[21];
      const tn = A[19] + A[20] * dipoleTiltRad;
      const ts = A[19] - A[20] * dipoleTiltRad;

      const xn = Math.acos(Math.cos(te) * Math.cos(tn) + Math.sin(te) * Math.sin(tn) * Math.cos(fi - Math.PI / 2));
      const xs = Math.acos(Math.cos(te) * Math.cos(ts) + Math.sin(te) * Math.sin(ts) * Math.cos(fi - 3 * Math.PI / 2));

      const b0 = A[6] + A[7] * (Math.exp(A[8] * bz) - 1) / (Math.exp(A[9] * bz) + 1);
      const b1 = A[10];
      const b2 = A[11] + A[12] * dipoleTiltRad;
      const b3 = A[13];

      const cn = A[14] * Math.pow(pressureSolar + pressureMagnetic, A[15]);
      const cs = cn;
      const dn = A[16] + A[17] * dipoleTiltRad + A[18] * Math.pow(dipoleTiltRad, 2);
      const ds = A[16] - A[17] * dipoleTiltRad + A[18] * Math.pow(dipoleTiltRad, 2);

      let f = Math.cos(te / 2) + A[5] * Math.sin(2 * te) * (1 - Math.exp(-1 * te));
      f = Math.pow(f, b0 + b1 * Math.cos(fi) + b2 * Math.sin(fi) + b3 * Math.pow(Math.sin(fi), 2));

      let f0 = 1 + A[2] * (Math.exp(A[3] * bz) - 1) / (Math.exp(A[4] * bz) + 1);
      f0 = A[0] * Math.pow(pressureSolar + pressureMagnetic, A[1]) * f0;

      // Rmp
      const altitude = f0 * f + cn * Math.exp(dn * Math.pow(xn, en)) + cs * Math.exp(ds * Math.pow(xs, es));

      return {
        latitude,
        longitude,
        altitude,
        toCartesian: () => ({
          x: altitude * Math.cos(latitudeRad) * Math.cos(longitudeRad),
          y: altitude * Math.cos(latitudeRad) * Math.sin(longitudeRad),
          z: altitude * Math.sin(latitudeRad),
        })
      };
    }

    return null;
  }
}
