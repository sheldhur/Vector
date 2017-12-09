// @flow
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import Chart from './Chart';
import World from './World';
import Graticule from './Graticule';
import GeomagEquator from './GeomagEquator';
import SolarTerminator from './SolarTerminator';
import StationVector from './StationVector';
import Axis from './../lineChart/Axis';
import Tooltip from './Tooltip';


class MapCylindrical extends Component {
  state = {
    isRenderMap: false,
    axisMargin: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  };
  uid = this.constructor.name + '-' + Math.random().toString(35).substr(2, 7);

  componentDidMount = () => {
    this.setState({
      isRenderMap: true,
      axisMargin: this.calculateAxisMargin()
    });
  };

  formatAngle = (d) => {
    return d + '°';
  };

  calculateAxisMargin = () => {
    const chart = ReactDOM.findDOMNode(this.refs.chart);
    const axis = chart.querySelector('.map-axis').getBBox();

    return {
      left: -axis.x,
      right: axis.width - this.props.width + axis.x,
      top: -axis.y,
      bottom: axis.height - this.props.height + axis.y
    }
  };

  calculateSize = (margin, axisMargin) => {
    const containerSize = {
      width: this.props.width,
      height: this.props.height,
    };

    let marginSumm = {
      width: margin.left + margin.right + axisMargin.left + axisMargin.right,
      height: margin.top + margin.bottom + axisMargin.top + axisMargin.bottom
    };

    let width = containerSize.width - marginSumm.width;
    let height = containerSize.height - marginSumm.height;

    let size = {
      width: width,
      height: height,
      container: containerSize
    };

    if (height !== undefined && width !== undefined) {
      size.width = height * 2;
      size.height = height;
      if (width < size.width) {
        size.width = width;
        size.height = (width / 2);
      }
    }

    size.container = {
      width: size.width + marginSumm.width,
      height: size.height + marginSumm.height,
    };

    console.log(size);

    return size;
  };

  render = () => {
    const {width, height, data, graticuleStep} = this.props;
    const {isRenderMap, axisMargin} = this.state;

    const margin = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    const size = this.calculateSize(margin, axisMargin);

    const projection = d3.geoEquirectangular()
    // .rotate([0, 0, 0])
      .scale(size.height / Math.PI)
      .translate([size.width / 2, size.height / 2]);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule().step(graticuleStep);
    const outline = graticule.outline();

    const scale = {
      x: d3.scaleLinear().domain([-180, 180]).range([projection([-180, 0])[0], projection([180, 0])[0]]),
      y: d3.scaleLinear().domain([-90, 90]).range([projection([0, -90])[1], projection([0, 90])[1]]),
    };
    const ticks = {
      x: d3.range(-180, 180 + 0.1, graticuleStep[0]),
      y: d3.range(-90, 90 + 0.1, graticuleStep[1])
    };

    return (
      <Chart
        width={size.container.width}
        height={size.container.height}
        ref="chart"
        shapeRendering={this.props.antiAliasing ? 'auto' : 'optimizeSpeed'}
      >
        <defs>
          <filter id={`${this.uid}-blur`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="0"/>
          </filter>
          <clipPath id={`${this.uid}-vector`}>
            <rect width={size.width} height={size.height}/>
          </clipPath>
        </defs>
        <g transform={`translate(${axisMargin.left + margin.left},${axisMargin.top + margin.top})`}>
          {isRenderMap && <g transform={`translate(1,0)`}>
            <World
              path={path}
              ocean={outline}
              size={{width, height}}
              {...this.props.world}
            />
            <Graticule
              path={path}
              graticule={graticule}
              outline={outline}
            />
            <GeomagEquator path={path}/>
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
            <Tooltip data={data} projection={projection}
            />
          </g>}
          <g className="map-axis">
            <Axis
              orient="left"
              scale={scale.y}
              tickValues={ticks.y}
              format={this.formatAngle}
              translate={`translate(0,0)`}
            >
              <text
                x={0}
                y={-10}
                dy="-2em"
                transform={`translate(0, ${size.height / 2}) rotate(-90)`}
              >
                gLat
              </text>
            </Axis>
            <Axis
              orient="bottom"
              scale={scale.x}
              tickValues={ticks.x}
              format={this.formatAngle}
              translate={`translate(0, ${size.height})`}
            >
              <text
                y={8}
                x={size.width / 2}
                dy="2em"
              >
                gLong
              </text>
            </Axis>
          </g>
        </g>
      </Chart>
    );
  };
}

MapCylindrical.defaultProps = {
  projectionType: 'equirectangular',
  dataFilter: null,
  graticuleStep: [30, 30],
  terminator: null,
  world: {},
  antiAliasing: true,
};

export default MapCylindrical;
