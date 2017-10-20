// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import * as d3 from 'd3';

class SolarTerminator extends Component {

  constructor(props) {
    super(props);
    this.PI = Math.PI;
    this.radians = this.PI / 180;
    this.degrees = 180 / this.PI;
  }

  antipode(position) {
    return [position[0] + 180, -position[1]];
  }

  solarPosition(time) {
    var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
      longitude = (d3.utcDay.floor(time) - time) / 864e5 * 360 - 180;
    return [
      longitude - this.equationOfTime(centuries) * this.degrees,
      this.solarDeclination(centuries) * this.degrees
    ];
  }

  // Equations based on NOAA’s Solar Calculator; all angles in radians.
  // http://www.esrl.noaa.gov/gmd/grad/solcalc/
  equationOfTime(centuries) {
    var e = this.eccentricityEarthOrbit(centuries),
      m = this.solarGeometricMeanAnomaly(centuries),
      l = this.solarGeometricMeanLongitude(centuries),
      y = Math.tan(this.obliquityCorrection(centuries) / 2);
    y *= y;
    return y * Math.sin(2 * l)
      - 2 * e * Math.sin(m)
      + 4 * e * y * Math.sin(m) * Math.cos(2 * l)
      - 0.5 * y * y * Math.sin(4 * l)
      - 1.25 * e * e * Math.sin(2 * m);
  }

  solarDeclination(centuries) {
    return Math.asin(Math.sin(this.obliquityCorrection(centuries)) * Math.sin(this.solarApparentLongitude(centuries)));
  }

  solarApparentLongitude(centuries) {
    return this.solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * this.radians)) * this.radians;
  }

  solarTrueLongitude(centuries) {
    return this.solarGeometricMeanLongitude(centuries) + this.solarEquationOfCenter(centuries);
  }

  solarGeometricMeanAnomaly(centuries) {
    return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * this.radians;
  }

  solarGeometricMeanLongitude(centuries) {
    var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
    return (l < 0 ? l + 360 : l) / 180 * this.PI;
  }

  solarEquationOfCenter(centuries) {
    var m = this.solarGeometricMeanAnomaly(centuries);
    return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries))
      + Math.sin(m + m) * (0.019993 - 0.000101 * centuries)
      + Math.sin(m + m + m) * 0.000289) * this.radians;
  }

  obliquityCorrection(centuries) {
    return this.meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * this.radians) * this.radians;
  }

  meanObliquityOfEcliptic(centuries) {
    return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * this.radians;
  }

  eccentricityEarthOrbit(centuries) {
    return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
  }

  render() {
    const {path, time} = this.props;

    if (time) {
      const utcTime = new Date(time.getTime() - time.getTimezoneOffset() * 60000);
      const circle = d3.geoCircle();
      const center = this.antipode(this.solarPosition(utcTime));

      return (
        <g className="map-terminator" filter={this.props.filter}>
          <path d={path(circle.center(center).radius(90)())}/>
        </g>
      );
    }

    return null;
  }
}

SolarTerminator.propTypes = {};
SolarTerminator.defaultProps = {
  style: {},
};

function mapStateToProps(state) {
  return {
    time: state.chart.chartCurrentTime
  };
}

export default connect(mapStateToProps, null)(SolarTerminator);
