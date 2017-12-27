// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

class TimeCursor extends Component {
  // componentDidUpdate = () => {
  //   if (this.context && this.context.onComponentDidUpdate !== undefined) {
  //     this.context.onComponentDidUpdate(this.displayName);
  //   }
  // };

  render = () => {
    const { currentTime } = this.props;
    const position = this.props.scale.x(currentTime);

    if (position > 0) {
      return (
        <g className="chart-time-cursor" transform={this.props.transform}>
          <line
            className="x"
            ref="lineX"
            y1="0"
            y2={this.props.height}
            transform={`translate(${this.props.scale.x(currentTime)}, 0)`}
            shapeRendering="optimizeSpeed"
          />
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
    currentTime: state.ui.chartCurrentTime ? new Date(state.ui.chartCurrentTime) : null
  };
}

export default connect(mapStateToProps, null)(TimeCursor);
