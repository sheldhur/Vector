import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';

class TimeCursor extends Component {

  // componentDidUpdate = () => {
  //   if (this.context && this.context.onComponentDidUpdate !== undefined) {
  //     this.context.onComponentDidUpdate(this.displayName);
  //   }
  // };

  render = () => {
    let {time} = this.props;

    const position = this.props.scale.x(time);

    if (position > 0) {
      return (
        <g className="chart-time-cursor" transform={this.props.transform}>
          <line className="x"
                ref="lineX"
                y1="0"
                y2={this.props.height}
                transform={`translate(${this.props.scale.x(time)}, 0)`}
                shapeRendering="optimizeSpeed"/>
        </g>
      );
    }

    return null;
  }
}

TimeCursor.propTypes = {};
TimeCursor.defaultProps = {};
// TimeCursor.contextTypes = {
//   test: PropTypes.string,
//   onComponentDidUpdate: PropTypes.any,
// };

function mapStateToProps(state) {
  return {
    time: state.chart.chartCurrentTime
  };
}

export default connect(mapStateToProps, null)(TimeCursor);
