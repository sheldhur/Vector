// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { numberIsBetween } from '../../utils/helper';


export class ResizeblePanel extends Component {
  state = {
    size: this.props.defaultSize
  };

  sendResizeEvent = () => {
    window.dispatchEvent(new CustomEvent('resize'));
    console.info('EVENT RESIZE');
  };

  handleResize = (event) => {
    event.preventDefault();

    // if (this.props.eventWhen === 'mousemove') {
    //   this.sendResizeEvent();
    // }

    let size = 0;
    if (this.props.type === 'horizontal') {
      size = numberIsBetween(100 * event.clientX / document.body.clientWidth, this.props.resizeRange, true, false);
    } else if (this.props.type === 'vertical') {
      size = numberIsBetween(100 * event.clientY / document.body.clientHeight, this.props.resizeRange, true, false);
    }

    if (size !== this.state.size) {
      this.setState({ size });
    }

    if (this.props.eventWhen === 'mousemove') {
      this.sendResizeEvent();
    }
  };

  handleResizeStart = (event) => {
    if (event.button === 0) {
      event.preventDefault();

      document.addEventListener('mousemove', this.handleResize);
      document.addEventListener('mouseup', this.handleResizeEnd);
    }
  };

  handleResizeEnd = (event) => {
    if (event.button === 0) {
      event.preventDefault();

      if (this.props.eventWhen === 'mouseup') {
        this.sendResizeEvent();
      }

      document.removeEventListener('mousemove', this.handleResize);
      document.removeEventListener('mouseup', this.handleResizeEnd);
    }
  };

  render = () => {
    let delimiterPos;
    let sizeFirst;
    let sizeSecond;

    if (this.props.type === 'horizontal') {
      delimiterPos = { left: `${this.state.size}%` };
      sizeFirst = { width: `${this.state.size}%` };
      sizeSecond = { width: `${100 - this.state.size}%` };
    } else if (this.props.type === 'vertical') {
      delimiterPos = { top: `${this.state.size}%` };
      sizeFirst = { height: `${this.state.size}%` };
      sizeSecond = { height: `${100 - this.state.size}%` };
    }

    return (
      <div className={`resizeble-panel ${this.props.type}`}>
        {React.cloneElement(this.props.children[0], { size: sizeFirst })}
        {React.cloneElement(this.props.children[1], { size: sizeSecond })}
        <div onMouseDown={this.handleResizeStart} style={delimiterPos} />
      </div>
    );
  };
}

ResizeblePanel.propTypes = {
  type: PropTypes.string,
  resizeRange: PropTypes.array,
  defaultSize: PropTypes.number,
  eventWhen: PropTypes.string
};

ResizeblePanel.defaultProps = {
  type: 'horizontal',
  resizeRange: [20, 80],
  eventWhen: 'mousemove'
};

export class Panel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={this.props.size} className={this.props.className}>{this.props.children}</div>
    );
  }
}
