import React, {Component, PropTypes, ReactDOM} from 'react';


class Chart extends Component {
  render() {
    return (
      <svg
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
