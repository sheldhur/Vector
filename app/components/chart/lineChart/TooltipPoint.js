import React, {Component, PropTypes} from 'react';


class TooltipPoint extends Component {
  render() {
    return <g className="tooltip-point" transform={`translate(${this.props.position.x}, ${this.props.position.y})`}>
      <circle fill={this.props.stroke} stroke={this.props.stroke}/>
    </g>
  }
}

TooltipPoint.propTypes = {};
TooltipPoint.defaultProps = {};

export default TooltipPoint;
