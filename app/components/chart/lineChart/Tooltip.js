// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {sprintf} from 'sprintf-js';
import * as d3 from 'd3';
import {mathAvg} from "../../../utils/helper";
import TooltipPoint from './TooltipPoint';
import TooltipText from './TooltipText';
import * as uiActions from '../../../actions/ui';

class Tooltip extends Component {

  componentDidMount = () => {
    const _handlerMouseMove = this.handlerMouseMove;
    const _handlerMouseClick = this.handlerMouseClick;
    const delay = this.props.delay;

    if (delay) {
      window.timeout = false;
    }

    d3.select(this.refs.rect)
      .on('mousemove', function () {
        const mousePosition = d3.mouse(this);
        if (window.timeout !== undefined) {
          clearTimeout(window.timeout);
          window.timeout = setTimeout(function () {
            _handlerMouseMove(mousePosition)
          }, delay);
        } else {
          _handlerMouseMove(mousePosition);
        }
      })
      .on('mouseout', this.handlerMouseOut)
      .on('click', function () {
        _handlerMouseClick(d3.mouse(this));
      });
  };

  handlerMouseClick = (mouse) => {
    const points = this.getCurrentPointList(mouse[0], this.props.data, this.props.scale);
    if (points.length) {
      this.props.uiActions.setChartCurrentTime(points[0].x);
      //
      this.props.onClick(points);
    }
  };

  handlerMouseOut = () => {
    if (window.timeout !== undefined) {
      clearTimeout(window.timeout);
    }
    this.props.uiActions.setChartTooltipTime(null);
  };

  handlerMouseMove = (mouse) => {
    const points = this.getCurrentPointList(mouse[0], this.props.data, this.props.scale);
    if (points[0] !== undefined) {
      this.props.uiActions.setChartTooltipTime(points[0].x);
    }
  };

  getCurrentPointList = (mousePosition, data, scale) => {
    const bisectDate = d3.bisector(d => d.x).left;

    let points = [];
    if (mousePosition === null) {
      return points;
    }

    data.forEach((linesGroup, linesGroupKey) => {
      linesGroup.lines.forEach((line, lineKey) => {
        const x0 = mousePosition instanceof Date ? mousePosition : scale.x.invert(mousePosition);
        const i = bisectDate(line.points, x0, 1);
        const point0 = line.points[i - 1];
        const point1 = line.points[i];

        if (point0 !== undefined && point1 !== undefined) {
          let point = x0 - point0.x > point1.x - x0 ? point1 : point0;
          point.stroke = line.style.stroke;
          point.name = line.name;
          point.si = linesGroup.si;
          point.format = line.format === undefined ? '%(y).2f %(si)s' : line.format;
          point.linesGroup = linesGroupKey;

          points.push(point);
        }
      });
    });

    return points;
  };

  render = () => {
    //const {points} = this.state;

    const points = this.getCurrentPointList(this.props.time, this.props.data, this.props.scale);

    let tooltipPointList = [];
    let tooltipTextList = [];
    let tooltipTextPosition = {x: [], y: []};
    points.forEach((item, i) => {
      if (item.y !== null) {
        tooltipPointList.push(<TooltipPoint
          key={`tooltipPoint-${i}` + i}
          stroke={item.stroke}
          position={{
            x: this.props.scale.x(item.x),
            y: this.props.scale.y[item.linesGroup](item.y)
          }}/>);

        if (this.props.group) {
          tooltipTextList.push(<tspan key={'tooltipText-' + i} fill={item.stroke} dy="1em"
                                      x="2.5">{sprintf(item.format, item)}</tspan>);
          tooltipTextPosition.x.push(this.props.scale.x(item.x));
          tooltipTextPosition.y.push(this.props.scale.y[item.linesGroup](item.y));
        } else {
          tooltipTextList.push(<TooltipText
            key={'tooltipText-' + i}
            stroke={item.stroke}
            width={this.props.width}
            position={{
              x: this.props.scale.x(item.x),
              y: this.props.scale.y[item.linesGroup](item.y)
            }}>{sprintf(item.format, item)}</TooltipText>);
        }
      }
    });

    if (this.props.group) {
      tooltipTextList = <TooltipText
        key={'tooltipText'}
        width={this.props.width}
        position={{
          x: Math.round(mathAvg(tooltipTextPosition.x)),
          y: Math.round(mathAvg(tooltipTextPosition.y))
        }}>{tooltipTextList}</TooltipText>;
    }

    return (
      <g className="chart-tooltip" transform={this.props.transform}>
        {points.length > 0 && <g>
          <line className="x"
                ref="lineX"
                y1="0"
                y2={this.props.height}
                transform={`translate(${this.props.scale.x(points[0].x)}, 0)`}
                shapeRendering="optimizeSpeed"/>
          {tooltipPointList.length && tooltipPointList}
          {tooltipPointList.length && tooltipTextList}
        </g>}
        <rect width={this.props.width}
              height={this.props.height}
              fill="none"
              ref="rect"
              pointerEvents="all"/>
      </g>
    );
  };
}

Tooltip.propTypes = {
  onClick: PropTypes.func,
  time: PropTypes.any,
  delay: PropTypes.number,
  group: PropTypes.bool,
};
Tooltip.defaultProps = {
  onClick: () => {
  },
  time: null,
  delay: 0,
  group: true,
};


function mapStateToProps(state) {
  return {
    time: state.chart.chartTooltipTime
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip);
