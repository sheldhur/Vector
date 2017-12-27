// @flow
import React, { Component } from 'react';


class Line extends Component {
  render() {
    return (
      <path d={this.props.path} fill="none" strokeWidth={1} {...this.props.style} />
    );
  }
}

Line.defaultProps = {
  path: '',
  style: {},
};

export default Line;
