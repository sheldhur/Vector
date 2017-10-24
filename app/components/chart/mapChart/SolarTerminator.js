// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as d3 from 'd3';
import * as solarPoint from './../../../lib/solarPoint';

class SolarTerminator extends Component {

  render = () => {
    const {projection, path, time} = this.props;

    if (time) {
      const utcTime = new Date(time.getTime() - time.getTimezoneOffset() * 60000);
      const circle = d3.geoCircle();
      const center = solarPoint.calculate(utcTime);
      const antipode = solarPoint.antipode(center);
      const coordinates = projection(center);

      return (
        <g className="map-terminator" filter={this.props.filter}>
          <circle
            cx={coordinates[0]}
            cy={coordinates[1]}
            r={6}
          />
          <path d={path(circle.center(antipode).radius(90)())}/>
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
