// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import hexToRgb from 'hex-to-rgb';
import * as ChartActions from './../../../actions/chart';
import * as stationsCalc from './../../../lib/stationsCalc';
import {openWindowStation} from './../../map/VectorMapMenu'


class StationVector extends Component {

  handlerMouseEnter = (station) => {
    this.props.chartActions.setMapTooltipStation(station);
  };

  handlerMouseOut = () => {
    this.props.chartActions.setMapTooltipStation(null);
  };

  handlerMouseClick = (station) => {
    openWindowStation(station.id);
  };

  prepareStationsData = () => {
    const {projection, pointSize, dataFilter, stations, stationsValue, extremes, maximum} = this.props;
    const {mapLayer} = this.props.settings.project;

    let data = [];

    if (stations && stationsValue) {
      stationsValue.forEach((stationValue) => {
        if (stations[stationValue.stationId] !== undefined && extremes[stationValue.stationId] !== undefined) {
          let station = stations[stationValue.stationId];
          if (station.status) {
            let delta = stationsCalc.delta(stationValue, extremes[stationValue.stationId]);
            data.push({...station, delta});
          }
        }
      });
    }

    if (dataFilter) {
      data = data.filter(dataFilter);
    }

    let points = [];

    let lines = [];
    let vectorLength = 50;
    let vectorStrength = mapLayer.dH.scaleAuto ? maximum.dH : mapLayer.dH.scale; //660
    let vectorNormal = vectorLength / vectorStrength;

    let circles = {
      positive: [],
      negative: [],
    };
    let circleRadius = 50 * (mapLayer.dZ.view === 'circle' ? 1 : 2);
    let circleStrength = mapLayer.dZ.scaleAuto ? maximum.dZ : mapLayer.dZ.scale; //486 * 2;
    let circleNormal = circleRadius / circleStrength;

    data.forEach((item, i) => {
      item.longitude = item.longitude > 180 ? item.longitude - 360 : item.longitude;
      let coordinates = projection([item.longitude, item.latitude]);

      let pointClass = 'defalut';
      if (item.delta !== undefined) {
        if (mapLayer.dH.enabled) {
          if (item.delta.dX && item.delta.dY) {
            let coordinates2 = [
              item.longitude + (item.delta.vector.Y * vectorNormal),
              item.latitude + (item.delta.vector.X * vectorNormal)
            ];

            if (coordinates2[0] > 180) {
              coordinates2[0] += 360;
            }
            if (coordinates2[0] < 180) {
              coordinates2[0] -= 360;
            }

            coordinates2 = projection(coordinates2);

            lines.push(<line
                key={'line-' + i}
                x1={coordinates[0]}
                y1={coordinates[1]}
                x2={coordinates2[0]}
                y2={coordinates2[1]}
              />
            );
          }
        }

        if (mapLayer.dZ.enabled) {
          if (item.delta.dZ) {
            let circleClass = item.delta.dZ > 0 ? 'positive' : 'negative';
            circles[circleClass].push(<circle
              key={'circle-' + i}
              cx={coordinates[0]}
              cy={coordinates[1]}
              r={Math.abs(item.delta.dZ * circleNormal)}
              fill={`url(#circle-${circleClass})`}
            />);
          }
        }
      } else {
        pointClass = 'bad-value';
      }

      //should be so transform={'rotate(45,' + coordinates[0] + ',' + coordinates[1] + ')'}
      //but in the electron 1.6.12+ it's a bug.
      points.push(<rect
        key={'point-' + i}
        width={pointSize}
        height={pointSize}
        x={coordinates[0] - pointSize / 2}
        y={coordinates[1] - pointSize / 2}
        onClick={(e) => this.handlerMouseClick(item)}
        onMouseEnter={(e) => this.handlerMouseEnter(item)}
        onMouseOut={(e) => this.handlerMouseOut()}
        transform={'rotate(45)'}
        className={pointClass}
      />);
    });

    return {points, lines, circles};
  };

  render() {
    const {mapLayer} = this.props.settings.project;
    const data = this.prepareStationsData();
    const color = {
      positive: hexToRgb(mapLayer.dZ.color.positive),
      negative: hexToRgb(mapLayer.dZ.color.negative),
    };

    let style = {
      circle: {
        positive: {
          start: {
            stopColor: `rgba(${color.positive.join(',')}, 0.75)`,
            stopOpacity: 1,
          },
          end: {
            stopColor: `rgba(${color.positive.join(',')}, 0.5)`,
            stopOpacity: mapLayer.dZ.view === 'circle' ? 1 : 0,
          }
        },
        negative: {
          start: {
            stopColor: `rgba(${color.negative.join(',')}, 0.75)`,
            stopOpacity: 1,
          },
          end: {
            stopColor: `rgba(${color.negative.join(',')}, 0.5)`,
            stopOpacity: mapLayer.dZ.view === 'circle' ? 1 : 0,
          }
        }
      }
    };

    return (
      <g className="map-point" clipPath={this.props.clipPath} ref="points">
        <defs>
          <radialGradient id="circle-positive" cx="50%" cy="50%" r="25%" fx="50%" fy="50%">
            <stop offset="0%" style={style.circle.positive.start}/>
            <stop offset="100%" style={style.circle.positive.end}/>
          </radialGradient>
          <radialGradient id="circle-negative" cx="50%" cy="50%" r="25%" fx="50%" fy="50%">
            <stop offset="0%" style={style.circle.negative.start}/>
            <stop offset="100%" style={style.circle.negative.end}/>
          </radialGradient>
        </defs>
        <g>
          {data.circles.positive}
          {data.circles.negative}
        </g>
        <g>{data.lines}</g>
        <g>{data.points}</g>
      </g>
    );
  }
}

StationVector.propTypes = {};
StationVector.defaultProps = {
  pointSize: 5,
  data: [],
  dataFilter: null
};

function mapStateToProps(state) {
  return {
    stations: state.station.stations,
    stationsValue: state.station.stationsValue,
    extremes: state.station.extremes,
    maximum: state.station.maximum,
    settings: state.main.settings,
    // isStartTime: state.chart.chartCurrentTime && state.main.settings.project.time.selected.start.valueOf() === state.chart.chartCurrentTime.valueOf()
  };
}

function mapDispatchToProps(dispatch) {
  return {
    chartActions: bindActionCreators(ChartActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationVector);
