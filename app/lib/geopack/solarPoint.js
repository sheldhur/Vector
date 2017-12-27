import * as d3 from 'd3';

const PI = Math.PI;
const radians = PI / 180;
const degrees = 180 / PI;

export const antipode = (position) => ({
  longitude: position.longitude + 180,
  latitude: -position.latitude
});

export const calculate = (time) => {
  const centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525; // since J2000
  const longitude = (d3.utcDay.floor(time) - time) / 864e5 * 360 - 180;

  const result = {
    longitude: longitude - equationOfTime(centuries) * degrees,
    latitude: solarDeclination(centuries) * degrees,
  };

  const nr = Math.round(longitude / 360);
  result.longitude -= (360 * nr);

  return result;
};

// Equations based on NOAA’s Solar Calculator; all angles in radians.
// http://www.esrl.noaa.gov/gmd/grad/solcalc/
const equationOfTime = (centuries) => {
  let e = eccentricityEarthOrbit(centuries),
    m = solarGeometricMeanAnomaly(centuries),
    l = solarGeometricMeanLongitude(centuries),
    y = Math.tan(obliquityCorrection(centuries) / 2);
  y *= y;
  return y * Math.sin(2 * l)
    - 2 * e * Math.sin(m)
    + 4 * e * y * Math.sin(m) * Math.cos(2 * l)
    - 0.5 * y * y * Math.sin(4 * l)
    - 1.25 * e * e * Math.sin(2 * m);
};

const solarDeclination = (centuries) => Math.asin(Math.sin(obliquityCorrection(centuries)) * Math.sin(solarApparentLongitude(centuries)));

const solarApparentLongitude = (centuries) => solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;

const solarTrueLongitude = (centuries) => solarGeometricMeanLongitude(centuries) + solarEquationOfCenter(centuries);

const solarGeometricMeanAnomaly = (centuries) => (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;

const solarGeometricMeanLongitude = (centuries) => {
  const l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
  return (l < 0 ? l + 360 : l) / 180 * PI;
};

const solarEquationOfCenter = (centuries) => {
  const m = solarGeometricMeanAnomaly(centuries);
  return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries))
    + Math.sin(m + m) * (0.019993 - 0.000101 * centuries)
    + Math.sin(m + m + m) * 0.000289) * radians;
};

const obliquityCorrection = (centuries) => meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;

const meanObliquityOfEcliptic = (centuries) => (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;

const eccentricityEarthOrbit = (centuries) => 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
