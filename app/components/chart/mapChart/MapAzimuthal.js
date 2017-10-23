// @flow
import React, {Component} from 'react';
import * as d3 from 'd3';
import Chart from './Chart';
import World from './World';
import Graticule from './Graticule';
import GeomagEquator from './GeomagEquator';
import SolarTerminator from './SolarTerminator';
import StationVector from './StationVector';
import Axis from './../lineChart/Axis';
import Tooltip from './Tooltip';
import './../../../utils/helper';


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
  uid = this.constructor.name + '-' + Math.random().toString(35).substr(2, 7);

  calculateSize = (margin, axisMargin) => {
    return {
      width: this.props.width - 25,
      height: this.props.height - 25,
      container: {
        width: this.props.width,
        height: this.props.height,
      }
    }
  };

  render = () => {
    const {width, height, data, graticuleStep, clipAngle, rotate} = this.props;
    const {isRenderMap, axisMargin} = this.state;

    const margin = {
      left: 13,
      right: 0,
      top: 13,
      bottom: 0
    };
    const size = this.calculateSize(margin, axisMargin);

    const projection = d3.geoStereographic()
      .clipAngle(clipAngle) //60
      .scale(size.height / Math.PI * 1.5) //2.6
      .translate([size.width / 2, size.height / 2])
      .rotate(rotate)
      .precision(0.6);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule().step(graticuleStep);
    const outline = {type: 'Sphere'};

    const range = d3.range(0, 360, graticuleStep[0]).reverse();
    let ticks = [];
    range.forEach((item, i) => {
      let transform = "rotate(" + (item - 90) + ")translate(" + Math.PI * (size.height / 6.55) + ")rotate(" + (item > 270 || item < 90 ? 90 : -90) + ")";
      let dy = item > 270 || item < 90 ? "-0.65em" : "1.3em";
      let y2 = item > 270 || item < 90 ? -5 : 5;
      ticks.push(<g key={`axis-tick-${i}`} className="tick" transform={transform}>
        <text textAnchor="middle" dy={dy}>{item}°</text>
        <line y2={y2}></line>
      </g>);
    });

    let coordinates = projection([0, 0]);

    //2011, 7, 9, 7, 2
    return (
      <Chart width={size.container.width} height={size.container.height} ref="chart"
             shapeRendering={this.props.antiAliasing ? 'auto' : 'optimizeSpeed'}>
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0"/>
          </filter>
          <clipPath id={`${this.uid}-vector`}>
            <path d={path(outline)}/>
          </clipPath>
        </defs>
        <g transform={`translate(${axisMargin.left + margin.left},${axisMargin.top + margin.top})`}>
          {isRenderMap && <g transform={`translate(0,0)`}>
            <World path={path} ocean={outline} size={{width, height}} {...this.props.world}/>
            <Graticule path={path} graticule={graticule} outline={outline} shapeRendering="auto"/>
            <GeomagEquator path={path}/>
            <SolarTerminator path={path} date={this.props.terminator} filter="url(#blurMe)" clipPath="url(#clip)"/>
            <StationVector path={path} data={data} dataFilter={this.props.dataFilter} pointSize={5}
                           projection={projection} clipPath={`url(#${this.uid}-vector)`}/>
            <Tooltip data={data} projection={projection} width={size.container.width} height={size.container.height}/>
            <circle cx={coordinates[0]} cy={coordinates[1]} r="3" fill="red" stroke="#888888"/>
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

export default MapAzimuthal
