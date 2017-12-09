// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as d3 from 'd3';
import {solarPoint} from '../../../lib/geopack';

class SolarTerminator extends Component {

  render = () => {
    const {projection, path, currentTime, pointRadius} = this.props;

    if (currentTime) {
      const utcTime = new Date(currentTime.getTime() - currentTime.getTimezoneOffset() * 60000);
      const circle = d3.geoCircle();
      const center = solarPoint.calculate(utcTime);
      const antipode = solarPoint.antipode(center);
      const coordinates = projection([center.longitude, center.latitude]);

      return (
        <g className="map-terminator" filter={this.props.filter} clipPath={this.props.clipPath}>
          <g
            className="map-solar-point"
            transform={`translate(${coordinates[0] - pointRadius}, ${coordinates[1] - pointRadius})`}
          >
            <g shapeRendering="optimizeSpeed">
              <line x1={0} y1={pointRadius} x2={pointRadius * 2} y2={pointRadius}/>
              <line x1={pointRadius} y1={0} x2={pointRadius} y2={pointRadius * 2}/>
            </g>
            <g transform="rotate(45, 7.5, 7.5)">
              <line x1={0} y1={pointRadius} x2={pointRadius * 2} y2={pointRadius}/>
              <line x1={pointRadius} y1={0} x2={pointRadius} y2={pointRadius * 2}/>
            </g>
          </g>
          <path d={path(circle.center([antipode.longitude, antipode.latitude]).radius(90)())}/>
        </g>
      );
    }

    return null;
  }
}

SolarTerminator.propTypes = {};
SolarTerminator.defaultProps = {
  style: {},
  pointRadius: 7.5,
};

function mapStateToProps(state) {
  return {
    currentTime: state.chart.chartCurrentTime ? new Date(state.chart.chartCurrentTime) : null
  };
}

export default connect(mapStateToProps, null)(SolarTerminator);
