import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import hexToRgb from 'hex-to-rgb';
import { openWindowStation } from '../../map/VectorMapMenu';
import * as uiActions from '../../../actions/ui';
import * as stationsCalc from '../../../utils/stationsCalc';


class StationVector extends Component {
  state = {
    hasError: false,
  };

  handlerMouseEnter = (station) => {
    this.props.uiActions.setMapTooltipStation(station);
  };

  handlerMouseOut = () => {
    this.props.uiActions.setMapTooltipStation(null);
  };

  handlerMouseClick = (station) => {
    openWindowStation(station.id);
  };

  componentDidCatch = (error, info) => {
    this.setState({ hasError: true });
  };

  prepareStationsData = () => {
    const {
      projection, pointSize, dataFilter, stations, stationsValue, extremes, maximum, mapLayerH, mapLayerZ, isShowNames
    } = this.props;

    let data = [];

    if (stations && stationsValue) {
      stationsValue.forEach((stationValue) => {
        if (stations[stationValue.stationId] !== undefined && extremes[stationValue.stationId] !== undefined) {
          const station = stations[stationValue.stationId];
          if (station.status) {
            const delta = stationsCalc.delta(stationValue, extremes[stationValue.stationId]);
            data.push({ ...station, delta });
          }
        }
      });
    }

    if (dataFilter) {
      data = data.filter(dataFilter);
    }

    const points = [];

    const lines = [];
    const vectorLength = 50;
    const vectorStrength = mapLayerH.scaleAuto ? maximum.dH : mapLayerH.scale; // 660
    const vectorNormal = vectorLength / vectorStrength;

    const circles = {
      positive: [],
      negative: [],
    };
    const circleRadius = 50 * (mapLayerZ.view === 'circle' ? 1 : 2);
    const circleStrength = mapLayerZ.scaleAuto ? maximum.dZ : mapLayerZ.scale; // 486 * 2;
    const circleNormal = circleRadius / circleStrength;


    const names = [];
    if (isShowNames) {
      for (const stationId in stations) {
        const item = stations[stationId];
        const coordinates = projection([item.longitude, item.latitude]);
        names.push((
          <text
            key={`name-${stationId}`}
            x={coordinates[0]}
            y={coordinates[1]}
            dy="-0.75em"
            onClick={() => this.handlerMouseClick(item)}
            onMouseEnter={() => this.handlerMouseEnter(item)}
            onMouseLeave={() => this.handlerMouseOut()}
          >
            {item.name}
          </text>
        ));

        points.push(<rect
          key={`point-${item.id}`}
          width={pointSize}
          height={pointSize}
          x={coordinates[0] - (pointSize / 2)}
          y={coordinates[1] - (pointSize / 2)}
          onClick={() => this.handlerMouseClick(item)}
          onMouseEnter={() => this.handlerMouseEnter(item)}
          onMouseLeave={() => this.handlerMouseOut()}
          transform={`rotate(45, ${coordinates[0]}, ${coordinates[1]})`}
          className="defalut"
        />);
      }
    } else {
      data.forEach((item, i) => {
        item.longitude = item.longitude > 180 ? item.longitude - 360 : item.longitude;
        const coordinates = projection([item.longitude, item.latitude]);

        let pointClass = 'defalut';
        if (item.delta !== undefined) {
          if (mapLayerH.enabled) {
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
                key={`line-${item.id}`}
                x1={coordinates[0]}
                y1={coordinates[1]}
                x2={coordinates2[0]}
                y2={coordinates2[1]}
              />);
            }
          }

          if (mapLayerZ.enabled) {
            if (item.delta.dZ) {
              const circleClass = item.delta.dZ > 0 ? 'positive' : 'negative';
              circles[circleClass].push(<circle
                key={`circle-${item.id}`}
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

        points.push(<rect
          key={`point-${item.id}`}
          width={pointSize}
          height={pointSize}
          x={coordinates[0] - (pointSize / 2)}
          y={coordinates[1] - (pointSize / 2)}
          onClick={() => this.handlerMouseClick(item)}
          onMouseEnter={() => this.handlerMouseEnter(item)}
          onMouseLeave={() => this.handlerMouseOut()}
          transform={`rotate(45, ${coordinates[0]}, ${coordinates[1]})`}
          className={pointClass}
        />);
      });
    }

    return {
      points, lines, circles, names
    };
  };

  render = () => {
    if (!this.state.hasError) {
      const { mapLayerZ } = this.props;
      const data = this.prepareStationsData();
      const color = {
        positive: hexToRgb(mapLayerZ.color.positive),
        negative: hexToRgb(mapLayerZ.color.negative),
      };

      const style = {
        circle: {
          positive: {
            start: {
              stopColor: `rgba(${color.positive.join(',')}, 0.75)`,
              stopOpacity: 1,
            },
            end: {
              stopColor: `rgba(${color.positive.join(',')}, 0.5)`,
              stopOpacity: mapLayerZ.view === 'circle' ? 1 : 0,
            }
          },
          negative: {
            start: {
              stopColor: `rgba(${color.negative.join(',')}, 0.75)`,
              stopOpacity: 1,
            },
            end: {
              stopColor: `rgba(${color.negative.join(',')}, 0.5)`,
              stopOpacity: mapLayerZ.view === 'circle' ? 1 : 0,
            }
          }
        }
      };

      return (
        <g className="map-point" clipPath={this.props.clipPath} ref="points">
          <defs>
            <radialGradient id="circle-positive" cx="50%" cy="50%" r="25%" fx="50%" fy="50%">
              <stop offset="0%" style={style.circle.positive.start} />
              <stop offset="100%" style={style.circle.positive.end} />
            </radialGradient>
            <radialGradient id="circle-negative" cx="50%" cy="50%" r="25%" fx="50%" fy="50%">
              <stop offset="0%" style={style.circle.negative.start} />
              <stop offset="100%" style={style.circle.negative.end} />
            </radialGradient>
          </defs>
          <g>
            {data.circles.positive}
            {data.circles.negative}
          </g>
          <g>{data.lines}</g>
          <g>{data.points}</g>
          <g>{data.names}</g>
        </g>
      );
    }

    return null;
  };
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
    mapLayerH: state.main.settings.projectMapLayerH,
    mapLayerZ: state.main.settings.projectMapLayerZ,
    // timeStart: state.main.settings.projectTimeSelectedStart,
    // currentTime: state.chart.chartCurrentTime,
    isShowNames: !state.ui.chartCurrentTime || (state.ui.chartCurrentTime && state.ui.chartCurrentTime === state.main.settings.projectTimeSelected[0].valueOf())
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationVector);
