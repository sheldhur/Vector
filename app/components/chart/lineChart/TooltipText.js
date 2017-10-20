// @flow
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';


class TooltipText extends Component {

  componentDidMount() {
    this.getTextSize();
  }

  componentDidUpdate() {
    this.getTextSize();
  }

  getTextSize() {
    let textSize = ReactDOM.findDOMNode(this.refs.text).getBBox();
    textSize.width += 5;
    textSize.height += 2.5;
    d3.select(this.refs.rect)
      .attr('width', textSize.width)
      .attr('height', textSize.height);

    let textWrapperPositionX = 7;
    if (this.props.position.x + textSize.width + textWrapperPositionX > this.props.width) {
      textWrapperPositionX = -(textSize.width + textWrapperPositionX);
    }

    d3.select(this.refs.textWrapper)
      .attr('transform', `translate(${textWrapperPositionX}, ${-(textSize.height / 2)})`);
  }

  render() {
    return <g className={`tooltip-text ${this.props.className}`} transform={`translate(${this.props.position.x}, ${this.props.position.y})`}>
      <g ref="textWrapper" transform="translate(7, 0)">
        <rect ref="rect"/>
        <text ref="text" fill={this.props.stroke} dy="1em" x="2.5">{this.props.children}</text>
      </g>
    </g>
  }
}

TooltipText.propTypes = {};
TooltipText.defaultProps = {};

export default TooltipText;
