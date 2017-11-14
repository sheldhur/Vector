// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {sprintf} from 'sprintf-js';
import * as d3 from 'd3';
import Chart from './lineChart/Chart';
import Line from './lineChart/Line';
import Axis from './lineChart/Axis';
import Grid from './lineChart/Grid';
import Tooltip from './lineChart/Tooltip';
import TimeCursor from './lineChart/TimeCursor';
import './../../utils/helper';


//TODO: переделать всё.
//TODO: убоать лишние ререндеры.
//TODO: фиксированный множитель шрифтов, для terminus 5.5 (277:92). Переделать вычисление размеров axis'ов.
//TODO: Убрать зависимости от redux, сделать компонент полностью универсальным
//TODO: вынести ререндер Tooltip, TimeCursor, StationsVector в отдельный svg, т.к. они польностью перерисовываюь и жрет время
class LineChart extends Component {
  addPixels = 10;
  state = {
    axisSize: {},
    wrapperSize: {
      width: undefined,
      height: undefined
    }
  };
  uid = this.constructor.name + '-' + Math.random().toString(35).substr(2, 7);

  componentDidMount = () => {
    setTimeout(this.handleResize, 1);
    // this.handleResize();

    if (this.props.width == '100%' || this.props.height == '100%') {
      window.addEventListener('resize', this.handleResize);
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleResize);
  };

  // componentDidUpdate(nextProps) {
  //   console.log([this.props.lastRender, nextProps.lastRender]);
  //   if (this.props.lastRender !== nextProps.lastRender) {
  //     setTimeout(this.handleResize, 10);
  //   }
  //   // this.handleResize();
  //   //this.setState({axisSize: this.calculateAxisSize()});
  // }

  componentWillReceiveProps(nextProps) {
    this.handleResize();
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (JSON.stringify(nextState.axisSize) === JSON.stringify(this.state.axisSize)) {
  //   return false;
  //   }
  //
  //   return true;
  // }

  handleResize = (e) => {
    let svgWrapper = ReactDOM.findDOMNode(this.refs.svgWrapper);
    let title = ReactDOM.findDOMNode(this.refs.title);

    if (svgWrapper) {
      this.setState({
        axisSize: this.getAxisSize(),
        wrapperSize: {
          width: svgWrapper.offsetWidth,
          height: svgWrapper.offsetHeight - 5 - (title !== null ? title.offsetHeight : 0)
        }
      });
    }
  };

  getAxisSize = () => {
    let size = {
      x: {
        width: [],
        height: []
      },
      y: {
        width: [],
        height: []
      }
    };

    let chart = d3.select(ReactDOM.findDOMNode(this.refs.chart));

    chart.selectAll('.axis--y').each(function () {
      let objSize = this.getBBox();
      size.y.width.push(objSize.width);
      size.y.height.push(objSize.height);
    });

    chart.selectAll('.axis--x').each(function () {
      let objSize = this.getBBox();
      size.x.width.push(objSize.width);
      size.x.height.push(objSize.height);
    });

    return size;
  };

  calculateAxisMargin = (axisSize) => {
    let margin = {
      left: 0,
      bottom: 0
    };

    if (axisSize.y !== undefined) {
      margin.left = axisSize.y.width.summ() + ((axisSize.y.width.length - 1) * this.addPixels);
    }

    if (axisSize.x !== undefined) {
      margin.bottom = axisSize.x.height.summ();
    }

    return margin;
  };

  calculateSize = (wrapperSize, margin, axisMargin) => {
    let containerSize = {
      width: (this.props.width == '100%') ? wrapperSize.width || 100 : this.props.width,
      height: (this.props.height == '100%') ? wrapperSize.height || 100 : this.props.height,
    };

    return {
      width: containerSize.width - margin.left - margin.right - axisMargin.left,
      height: containerSize.height - margin.top - margin.bottom - axisMargin.bottom,
      container: containerSize
    }
  };

  prepareData = (data, isGroupX = false, isGroupY = true) => {
    let extent = {
      x: [],
      y: []
    };

    let pointsCount = 0;

    if (data && data.length) {
      data.forEach((linesGroup, linesGroupKey) => {
        let result = {
          x: [],
          y: []
        };

        if (linesGroup.hasOwnProperty('lines') && linesGroup.lines != null && linesGroup.lines.length) {
          if (linesGroup.hasOwnProperty('extent')) {
            result = linesGroup.extent;
            linesGroup.lines.forEach((line, lineKey) => {
              if (line.hasOwnProperty('points') && line.points != null && line.points.length) {
                pointsCount += line.points.length;
              }
            });
          } else {
            linesGroup.lines.forEach((line, lineKey) => {
              if (line.hasOwnProperty('points') && line.points != null && line.points.length) {
                pointsCount += line.points.length;
                line.points.forEach((item, i) => {
                  if (typeof item.x === 'string') {
                    item.x = new Date(item.x);
                    data[linesGroupKey].lines[lineKey].points[i].x = item.x;
                  }

                  if (item.x !== null) {
                    if (result.x[0] === undefined) result.x.push(item.x);
                    if (result.x[1] === undefined) result.x.push(item.x);
                    if (item.x < result.x[0]) result.x[0] = item.x;
                    else if (item.x > result.x[1]) result.x[1] = item.x;
                  }

                  if (item.y !== null) {
                    if (result.y[0] === undefined) result.y.push(item.y);
                    if (result.y[1] === undefined) result.y.push(item.y);
                    if (item.y < result.y[0]) result.y[0] = item.y;
                    else if (item.y > result.y[1]) result.y[1] = item.y;
                  }
                });
              }
            });
          }

          if (!isGroupX) {
            extent.x = extent.x.concat(...result.x);
            extent.x = d3.extent(extent.x);
          } else {
            extent.x.push(result.x);
          }

          if (!isGroupY) {
            extent.y = extent.y.concat(...result.y);
            extent.y = d3.extent(extent.y);
          } else {
            extent.y.push(result.y);
          }
        }
      });
    }

    return {data, extent, pointsCount};
  };

  getScaleType = (value) => {
    return Object.prototype.toString.call(value) === '[object Date]' ? d3.scaleTime() : d3.scaleLinear();
  };

  getScale = (extent, size) => {
    // + (item.y / 100 * 10)
    return {
      x: this.getScaleType(extent.x[0]).range([0, size.width]).domain(extent.x),
      y: extent.y.map(item => {
        let min = Math.min(...item);
        let max = Math.max(...item);

        let padding = (max - min) / size.height;
        max += padding * 10;
        min -= padding * 5;

        return this.getScaleType(min).range([size.height, 0]).domain([min, max]);
      })
    }
  };

  getCurve = (value) => {
    let type = Array.isArray(value) ? value : [value];

    if (type.length) {
      const curve = 'curve' + type[0];
      if (d3.hasOwnProperty(curve)) {
        if (['curveCardinal', 'curveCardinalClosed', 'curveCardinalOpen'].indexOf(curve) !== -1) {
          return d3[curve].tension(type[1] || 0.5);
        } else if (['curveCatmullRom', 'curveCatmullRomClosed', 'curveCatmullRomOpen'].indexOf(curve) !== -1) {
          return d3[curve].alpha(type[1] || 0.5);
        } else if (['curveBundle'].indexOf(curve) !== -1) {
          return d3[curve].beta(type[1] || 0.5);
        } else {
          return d3[curve];
        }
      }
    }

    return d3.curveCatmullRom.alpha(0.5);
  };

  multiFormatDate = (date) => {
    let formatMillisecond = d3.timeFormat(":%S.%L"),
      formatSecond = d3.timeFormat(":%S"),
      formatMinute = d3.timeFormat("%H:%M"),
      formatHour = d3.timeFormat("%H:%M"),
      formatDay = d3.timeFormat("%d.%m.%y"), //%d.%m.%y
      formatWeek = d3.timeFormat("%d.%m.%y"), //%d.%m.%y
      formatMonth = d3.timeFormat("%B"),
      formatYear = d3.timeFormat("%Y");

    return (d3.timeSecond(date) < date ? formatMillisecond
      : d3.timeMinute(date) < date ? formatSecond
        : d3.timeHour(date) < date ? formatMinute
          : d3.timeDay(date) < date ? formatHour
            : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
              : d3.timeYear(date) < date ? formatMonth
                : formatYear)(date);
  };

  multiFormatFloat = (float) => {
    return sprintf('%.5g', float);
  };

  multiFormat = (value) => {
    if (Object.prototype.toString.call(value) === '[object Date]') {
      return this.multiFormatDate(value);
    }

    return this.multiFormatFloat(value);
  };

  render = () => {
    const {data, extent, pointsCount} = this.prepareData(this.props.data);

    if (pointsCount) {
      const {axisSize, wrapperSize} = this.state;

      const margin = {
        left: 5,
        right: 27,
        top: 2,
        bottom: 2
      };
      const axisMargin = this.calculateAxisMargin(axisSize);
      const size = this.calculateSize(wrapperSize, margin, axisMargin);
      const isRenderLines = axisMargin.left > 0;
      const scale = this.getScale(extent, size);
      const ticks = {
        x: this.props.ticks ? this.props.ticks.x : Math.ceil(size.width / 90),
        y: this.props.ticks ? this.props.ticks.y : Math.ceil(size.height / 20)
      };

      console.info('RERENDER CHART');

      let LineList = [];
      let AxisList = [];
      let currentMarginLeft = 0;
      data.forEach((linesGroup, linesGroupKey) => {
        currentMarginLeft += isRenderLines ? axisSize.y.width[linesGroupKey] : 0;
        if (linesGroupKey > 0) {
          currentMarginLeft += this.addPixels;
        }

        AxisList.push(<Axis key={'axis-y-' + linesGroupKey}
                            orient="left"
                            scale={scale.y[linesGroupKey]}
                            ticks={ticks.y}
                            format={this.multiFormat}
                            translate={`translate(${currentMarginLeft}, 0)`}>
          <text x={-size.height / 2}
                y="5"
                dy="1em"
                fill={linesGroup.lines[0].style.stroke || '#000'}
                transform={(isRenderLines ? `translate(${-(axisSize.y.width[linesGroupKey] + 5.5)},0)` : '') + 'rotate(-90)'}>
            {linesGroup.siX || linesGroup.si}
          </text>
        </Axis>);

        if (isRenderLines) {
          linesGroup.lines.forEach((line, lineKey) => {
            let path = d3.line()
              .defined(d => d.y !== null)
              .curve(this.getCurve(line.curve))
              .x(d => scale.x(d.x))
              .y(d => scale.y[linesGroupKey](d.y));

            LineList.push(<Line key={'line-' + linesGroupKey + '-' + lineKey}
                                path={path(line.points)}
                                style={line.style}/>);
          });
        }
      });

      return (
        <div className="svg-wrapper" ref="svgWrapper">
          {this.props.children !== undefined && <div ref="title" className="chart-title">{this.props.children}</div>}
          <Chart width={size.container.width} height={size.container.height} ref="chart"
                 shapeRendering={this.props.antiAliasing ? 'auto' : 'optimizeSpeed'}>
            <defs>
              <clipPath id={`${this.uid}-lines`}>
                <rect width={size.width} height={size.height}/>
              </clipPath>
            </defs>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {isRenderLines && <g>
                <g className="axisGrid" transform={`translate(${axisMargin.left}, 0)`}>
                  <Grid orient="left"
                        scale={scale.y[scale.y.length - 1]}
                        ticks={ticks.y}
                        tickSize={-size.width}
                        translate={`translate(0, 0)`}/>
                  <Grid orient="bottom"
                        scale={scale.x}
                        ticks={ticks.x}
                        tickSize={-size.height}
                        translate={`translate(0, ${size.height})`}/>
                </g>
                <g className="lines" transform={`translate(${axisMargin.left}, 0)`}
                   clipPath={`url(#${this.uid}-lines)`}>
                  {LineList}
                </g>
              </g>}
              <g className="axisLeft">
                {AxisList}
              </g>
              <g className="axisBottom" transform={`translate(${axisMargin.left}, 0)`}>
                <Axis
                  orient="bottom"
                  scale={scale.x}
                  ticks={ticks.x}
                  format={this.multiFormat}
                  translate={`translate(0, ${size.height})`}
                >
                  {this.props.labelY && <text y={8 + 5} x={size.width / 2} dy="2em">{this.props.labelY}</text>}
                </Axis>
              </g>
              {isRenderLines && <g>
                {this.props.showTimeCursor && <TimeCursor width={size.width}
                                                          height={size.height}
                                                          scale={scale}
                                                          transform={`translate(${axisMargin.left}, 0)`}
                                                          time={new Date(1999, 6 - 1, 28, 5, 37, 0, 0)}
                                                          groupName={this.props.groupName}/>}
                {this.props.showTooltip && <Tooltip width={size.width}
                                                    height={size.height}
                                                    delay={this.props.tooltipDelay}
                                                    onClick={this.props.tooltipOnClick}
                                                    transform={`translate(${axisMargin.left}, 0)`}
                                                    scale={scale}
                                                    data={data}
                                                    groupName={this.props.groupName}/>}
              </g>
              }
            </g>
          </Chart>
        </div>
      );
    } else {
      return (
        <div className='centered-box'>
          {this.props.emptyMessage}
        </div>
      );
    }
  };
}

LineChart.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  lastRender: PropTypes.any,
  showTimeCursor: PropTypes.bool,
  showTooltip: PropTypes.bool,
  tooltipDelay: PropTypes.number,
  tooltipOnClick: PropTypes.func,
  tick: PropTypes.array,
  groupName: PropTypes.string,
  labelY: PropTypes.string,
  antiAliasing: PropTypes.bool,
  emptyMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.element, PropTypes.func])
};

LineChart.defaultProps = {
  width: '100%',
  height: '100%',
  lastRender: null,
  showTimeCursor: true,
  showTooltip: true,
  tooltipDelay: 0,
  tooltipOnClick: () => {
  },
  tick: null,
  groupName: null,
  labelY: null,
  antiAliasing: true,
  emptyMessage: 'No Data'
};

export default LineChart;
