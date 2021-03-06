import React, { Component } from 'react';
import * as d3 from 'd3';
import interpolator from 'interpolating-polynomial';
import Chart from './Chart';
import World from './World';
import Graticule from './Graticule';
import GeomagEquator from './GeomagEquator';
import SolarTerminator from './SolarTerminator';
import StationVector from './StationVector';
import Tooltip from './Tooltip';
import { IS_PROD } from '../../../constants/app';

const scaleFactor = interpolator([
  [170, 0.131941969],
  [168, 0.15867751223091939],
  [165, 0.19795],
  [160, 0.265934761],
  [150, 0.404381469],
  [140, 0.549101428],
  [130, 0.70361102],
  [120, 0.87164905],
  [110, 1.056978256],
  [100, 1.26693152],
  [90, 1.510000025],
  [80, 1.800250819],
  [70, 2.157817949],
  [60, 2.615396589],
  [50, 3.240179428],
  [40, 4.151219858],
  [30, 5.635396181],
  [20, 8.568856971],
  [10, 17.26990111],
]);

class MapAzimuthal extends Component {
  state = {
    isRenderMap: true,
    axisMargin: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  };
  uid = `${this.constructor.name}-${Math.random().toString(35).substr(2, 7)}`;

  calculateSize = () => ({
    width: this.props.width - 25,
    height: this.props.height - 25,
    container: {
      width: this.props.width,
      height: this.props.height,
    }
  });

  render = () => {
    const {
      width, height, data, graticuleStep, clipAngle, rotate
    } = this.props;
    const { isRenderMap, axisMargin } = this.state;

    const margin = {
      left: 13,
      right: 0,
      top: 13,
      bottom: 0
    };
    const size = this.calculateSize(margin, axisMargin);

    const scale = size.height / Math.PI;

    const projection = d3.geoStereographic()
      .clipAngle(clipAngle)
      .scale(scale * scaleFactor(clipAngle))
      .translate([size.width / 2, size.height / 2])
      .rotate(rotate)
      .precision(0.1);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule().step(graticuleStep);
    const outline = { type: 'Sphere' };

    const range = d3.range(0, 360, graticuleStep[0]).reverse();
    const ticks = [];
    range.forEach((item, i) => {
      // const angle = item - 90 + (rotate[1] >= 0 ? 180 - rotate[2] : rotate[2]);
      // console.log(angle);
      let angle = (rotate[1] >= 0 ? item + 90 : item - 90) + (180 - rotate[2]);
      angle -= (Math.round(angle / 360) * 360);

      const transform = `rotate(${angle})translate(${Math.PI * (size.height / 6.55)})rotate(${angle < 0 ? 90 : -90})`;
      const dy = angle < 0 ? '-0.65em' : '1.3em';
      const y2 = angle < 0 ? -5 : 5;
      ticks.push(<g key={`axis-tick-${i}`} className="tick" transform={transform}>
        <text textAnchor="middle" dy={dy}> {item}°</text>
        <line y2={y2} />
      </g>);
    });

    const coordinates = projection([0, (90 - clipAngle)]);

    // 2011, 7, 9, 7, 2
    return (
      <Chart
        ready={isRenderMap}
        width={size.container.width}
        height={size.container.height}
        ref="chart"
        shapeRendering={this.props.antiAliasing ? 'auto' : 'optimizeSpeed'}
      >
        <defs>
          <filter id={`#${this.uid}-blur`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" />
          </filter>
          <clipPath id={`${this.uid}-vector`}>
            <path d={path(outline)} />
          </clipPath>
        </defs>
        <g transform={`translate(${axisMargin.left + margin.left},${axisMargin.top + margin.top})`}>
          {isRenderMap && <g transform="translate(0,0)">
            <World
              path={path}
              ocean={outline}
              size={{ width, height }}
              clipAngle={clipAngle}
              rotate={rotate}
              {...this.props.world}
            />
            <Graticule
              path={path}
              graticule={graticule}
              outline={outline}
              shapeRendering="auto"
              clipPath={`url(#${this.uid}-vector)`}
            />
            <GeomagEquator path={path} />
            <SolarTerminator
              path={path}
              projection={projection}
              date={this.props.terminator}
              clipPath={`url(#${this.uid}-vector)`}
            />
            <StationVector
              path={path}
              data={data}
              dataFilter={this.props.dataFilter}
              pointSize={5}
              projection={projection}
              clipPath={`url(#${this.uid}-vector)`}
            />
            <Tooltip
              data={data}
              projection={projection}
              width={size.container.width}
              height={size.container.height}
            />
            {IS_PROD == true && <circle cx={coordinates[0]} cy={coordinates[1]} r="3" fill="red" stroke="#888888" />}
          </g>}
          <g className="map-axis azimuthal" transform={`translate(${size.width / 2},${size.height / 2})`}>
            {ticks}
          </g>
        </g>
      </Chart>
    );
  };
}

MapAzimuthal.propTypes = {};
MapAzimuthal.defaultProps = {
  projectionType: 'stereographic',
  dataFilter: null,
  graticuleStep: [15, 15],
  rotate: [0, -90, 0],
  clipAngle: 90,
  terminator: null,
  world: {},
  antiAliasing: true,
};

export default MapAzimuthal;
