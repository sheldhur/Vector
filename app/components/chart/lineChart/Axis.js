import React, {Component, PropTypes} from 'react';
import * as d3 from 'd3';


class Axis extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.renderAxis();
  }

  componentDidUpdate() {
    this.renderAxis();
  }

  renderAxis() {
    let axis;
    if (this.props.orient === 'bottom') {
      axis = d3.axisBottom(this.props.scale);
    } else if (this.props.orient === 'left') {
      axis = d3.axisLeft(this.props.scale);
    }

    if (this.props.format !== undefined) {
      axis.tickFormat(this.props.format);
    }
    if (this.props.ticks !== undefined) {
      axis.ticks(this.props.ticks);
    }
    if (this.props.tickValues !== undefined) {
      axis.tickValues(this.props.tickValues);
    }

    axis.scale(this.props.scale);
    d3.select(this.refs.axis).call(axis);
  }

  render() {
    const {text, textStyle} = this.props;

    let className = ['axis'];
    if (this.props.orient === 'bottom') {
      className.push('axis--x');
    } else if (this.props.orient === 'left') {
      className.push('axis--y');
    }

    return (
      <g className={className.join(' ')}
         ref="axis"
         transform={this.props.translate}
         shapeRendering="optimizeSpeed">
        {this.props.children !== undefined && this.props.children}
      </g>
    );
  }
}

Axis.propTypes = {
  text: PropTypes.string,
  transform: PropTypes.array || PropTypes.string,
  ticks: PropTypes.number,
};

Axis.defaultProps = {
  transform: [],
  ticks: 5,
  tickValues: undefined,
  format: undefined
}

export default Axis;
