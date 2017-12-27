import * as fs from 'fs';
import interpolatorSpline from 'natural-spline-interpolator';
import * as solarPoint from './solarPoint';
import igrfCoefficients from './igrf12coeffs';
import { R2D, D2R } from './utils';

let coefficientsPrepared = null;
/**
 * https://scholar.uib.no/sites/default/files/birkeland/files/127-laundal_spacescirev_oa.pdf
 * http://sprg.ssl.berkeley.edu/~windsound/new/themis/IDL%20Geopack%20DLM.pdf
 * http://helios.fmi.fi/~juusolal/geomagnetism/Lectures/
 * http://geo.phys.spbu.ru/~tsyganenko/Geopack-2008.html
 * https://www.mathworks.com/matlabcentral/fileexchange/7941-convert-cartesian--ecef--coordinates-to-lat--lon--alt
 * */

export const readCoefficients = (filePath = './app/lib/geopack/igrf12coeffs.txt') => new Promise((resolve) => {
  fs.readFile(filePath, (error, rawData) => {
    if (error) {
      throw error;
    }

    const data = {};
    let header = null;

    const lineList = rawData.toString().split(/\n+/);
    lineList.forEach((line, i) => {
      line = line.trim();
      if (line !== '' && !line.startsWith('#')) {
        const lineSplit = line.split(/\s+/);
        if (!header) {
          header = lineSplit.map((item, i) => {
            if (i >= 3) {
              if (item.indexOf('-') !== -1) {
                const yearRange = item.split('-');
                const yearStart = parseFloat(yearRange[0]);
                const yearEnd = parseFloat(item.replace(/\d{2}-/i, ''));

                return yearStart > yearEnd ? yearEnd + 100 : yearEnd;
              }

              return parseFloat(item);
            }

            return item;
          });
        } else {
          const gh = lineSplit[0];
          const n = lineSplit[1];
          const m = lineSplit[2];
          lineSplit.forEach((item, i) => {
            if (i > 2) {
              if (!data.hasOwnProperty(gh)) {
                data[gh] = {};
              }
              if (!data[gh].hasOwnProperty(n)) {
                data[gh][n] = {};
              }
              if (!data[gh][n].hasOwnProperty(m)) {
                data[gh][n][m] = {};
              }

              const year = header[i];
              let value = parseFloat(item);
              if (i === lineSplit.length - 1) {
                value = parseFloat(lineSplit[i - 1]) + (value * (year - header[i - 1]));
              }
              data[gh][n][m][year] = value;
            }
          });
        }
      }
    });

    resolve(data);
  });
});

const coefficientsPrepare = (object, callback) => {
  const tmp = {};
  for (const gh in object) {
    tmp[gh] = {};
    for (const n in object[gh]) {
      tmp[gh][n] = {};
      for (const m in object[gh][n]) {
        tmp[gh][n][m] = callback(object[gh][n][m]);
      }
    }
  }

  return tmp;
};

export const coefficients = (date = new Date()) => {
  if (!coefficientsPrepared) {
    coefficientsPrepared = coefficientsPrepare(igrfCoefficients, (data) => {
      const values = [];
      for (const year in data) {
        values.push([
          Date.UTC(year, 0, 1, 0, 0, 0, 0),
          data[year]
        ]);
      }

      return interpolatorSpline(values);
    });
  }

  return coefficientsPrepare(coefficientsPrepared, (interpolate) => interpolate(date.getTime()));
};

export const dipoleAxis = (date) => {
  const { g, h } = coefficients(date);
  const b0 = Math.sqrt(Math.pow(g[1][0], 2) + Math.pow(g[1][1], 2) + Math.pow(h[1][1], 2));

  return {
    x: -g[1][1] / b0,
    y: -h[1][1] / b0,
    z: -g[1][0] / b0
  };
};

export const dipolePoles = (date) => {
  const { g, h } = coefficients(date);
  const b0 = Math.sqrt(Math.pow(g[1][0], 2) + Math.pow(g[1][1], 2) + Math.pow(h[1][1], 2));

  const n = { te: null, fi: null };
  const s = { te: null, fi: null };

  n.te = Math.acos(-g[1][0] / b0) / Math.PI * 180;
  s.te = 180 - n.te;

  s.fi = Math.atan2(h[1][1], g[1][1]) / Math.PI * 180;
  n.fi = s.fi - 180;

  return { n, s };
};

export const dipoleTiltAngle = (date) => {
  const subsolar = solarPoint.calculate(date);
  const vm = dipoleAxis(date);
  const vs = {
    x: Math.cos(subsolar.latitude * D2R) * Math.cos(subsolar.longitude * D2R),
    y: Math.cos(subsolar.latitude * D2R) * Math.sin(subsolar.longitude * D2R),
    z: Math.sin(subsolar.latitude * D2R),
  };

  return Math.asin((vm.x * vs.x) + (vm.y * vs.y) + (vm.z * vs.z)) * R2D;
};
