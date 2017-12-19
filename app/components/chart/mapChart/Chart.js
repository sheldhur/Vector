// @flow
import React, {Component} from 'react';


class Chart extends Component {
  render() {
    return (
      <svg
        className={this.props.ready ? 'ready' : null}
        width={this.props.width}
        height={this.props.height}
        style={this.props.style}
        shapeRendering={this.props.shapeRendering}
      >
        {this.props.children}
      </svg>
    );
  }
}

Chart.propTypes = {};
Chart.defaultProps = {
  style: {},
};

export default Chart
