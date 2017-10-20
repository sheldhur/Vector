// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';


class Grid extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.renderGrid();
  }

  componentDidUpdate() {
    this.renderGrid();
  }

  renderGrid() {
    let axis;
    if (this.props.orient === 'bottom') {
      axis = d3.axisBottom(this.props.scale);
    } else if (this.props.orient === 'left') {
      axis = d3.axisLeft(this.props.scale);
    }

    axis.ticks(this.props.ticks)

    d3.select(this.refs.grid).call(axis.tickSize(this.props.tickSize).tickFormat(''));
  }

  render() {
    let className = ['grid'];
    if (this.props.orient === 'bottom') {
      className.push('grid--x');
    } else if (this.props.orient === 'left') {
      className.push('grid--y');
    }

    return (
      <g className={className.join(' ')} ref="grid" transform={this.props.translate} shapeRendering="optimizeSpeed"></g>
    );
  }
}

Grid.propTypes = {
  transform: PropTypes.string,
  ticks: PropTypes.number,
  tickSize: PropTypes.number,
};

Grid.defaultProps = {
  transform: '',
  ticks: 5
}

export default Grid;
