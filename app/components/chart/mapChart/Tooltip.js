import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import TooltipText from '../lineChart/TooltipText';


class Tooltip extends Component {
  formatter = (value) => {
    let result = 'NaN';
    if (value) {
      result = value.toFixed(3);
      if (value >= 0) {
        result = ' ' + result;
      }
    }

    return result;
  };

  render = () => {
    const {station, projection, width, height} = this.props;

    if (station !== null) {
      const position = projection([station.longitude, station.latitude]);

      return (
        <TooltipText className="map-tooltip-text" position={{x: position[0], y: position[1]}} width={width} height={height} stroke="silver">
          <tspan dy="1em" x="2.5" style={{fontSize: '120%'}}>{station.name} {station.source}</tspan>
          <tspan dy="1em" x="2.5">lt {station.latitude.toFixed(3)}° lg {station.longitude.toFixed(3)}°</tspan>
          <tspan dy="1em" x="2.5" xmlSpace="preserve">ΔH: {this.formatter(station.delta.dH)} nT</tspan>
          <tspan dy="1em" x="2.5" xmlSpace="preserve">ΔX: {this.formatter(station.delta.dX)} nT</tspan>
          <tspan dy="1em" x="2.5" xmlSpace="preserve">ΔY: {this.formatter(station.delta.dY)} nT</tspan>
          <tspan dy="1em" x="2.5" xmlSpace="preserve">ΔZ: {this.formatter(station.delta.dZ)} nT</tspan>
          <tspan dy="1em" x="2.5" xmlSpace="preserve">ΔD: {this.formatter(station.delta.dD)}</tspan>
        </TooltipText>
      );
    }

    return null;
  }
}

Tooltip.propTypes = {};
Tooltip.defaultProps = {
  data: [],
  station: null
};


function mapStateToProps(state) {
  return {
    station: state.chart.mapTooltipStation
  };
}

export default connect(mapStateToProps, null)(Tooltip);
