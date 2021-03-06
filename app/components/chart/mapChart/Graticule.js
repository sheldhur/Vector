// @flow
import React, { Component } from 'react';


class Graticule extends Component {
  render() {
    const {
      path, graticule, shapeRendering, outline
    } = this.props;

    return (
      <g clipPath={this.props.clipPath}>
        <g className="map-graticule" shapeRendering={shapeRendering}>
          {graticule.lines().map((item, i) => <path key={`graticule-${i}`} d={path(item)} />)}
        </g>
        <path className="map-outline" d={path(outline)} />
      </g>
    );
  }
}

Graticule.propTypes = {};
Graticule.defaultProps = {
  shapeRendering: 'optimizeSpeed'
};

export default Graticule;
