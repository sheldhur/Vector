// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Tooltip, Button, Input, Tag, Icon } from 'antd';
import * as uiActions from '../../actions/ui';

class MainHeaderControls extends Component {
  state = {
    interval: null,
  };

  isHotKeyActive = true;

  componentWillReceiveProps = (nextProps) => {
    if (this.state.interval) {
      this.handlerPlay();
    }
  };

  componentWillMount = () => {
    window.addEventListener('keydown', this.handlerHotKey);

    setTimeout(() => {
      const mainPage = document.querySelector('#root .main-page');
      if (mainPage) {
        mainPage.addEventListener('mouseover', this.handlerMouseOver);
        mainPage.addEventListener('mouseleave', this.handlerMouseLeave);
      }
    }, 10);
  };

  componentWillUnmount = () => {
    window.removeEventListener('keydown', this.handlerHotKey);

    const mainPage = document.querySelector('#root .main-page');
    mainPage.removeEventListener('mouseover', this.handlerMouseOver);
    mainPage.removeEventListener('mouseleave', this.handlerMouseLeave);

    clearInterval(this.state.interval);
  };

  handlerMouseOver = (e) => {
    this.isHotKeyActive = true;
  };

  handlerMouseLeave = (e) => {
    this.isHotKeyActive = false;
  };

  handlerHotKey = (e) => {
    if (this.isHotKeyActive) {
      let value = 0;
      if (e.keyCode === 37) {
        value = -1;
      } else if (e.keyCode === 39) {
        value = 1;
      }

      if (e.ctrlKey) {
        value *= 10;
      }

      if (value) {
        this.handlerTimeShift(e, value);
      }

      if (e.keyCode === 32) {
        this.handlerPlay(e);
      }
    }
  };

  handlerTimeShift = (e, value) => {
    if (e) {
      e.preventDefault();
    }

    this.props.uiActions.shiftChartCurrentTime(value);

    if (this.props.onTick && typeof this.props.onTick === 'function') {
      this.props.onTick();
    }
  };

  handlerPlay = (e) => {
    e.preventDefault();
    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.setState({ interval: null });
    } else {
      this.setState({
        interval: setInterval(() => {
          this.handlerTimeShift(null, +1);
        }, this.props.playDelay * 1000)
      });
    }
  };

  render = () => {
    let buttons = [
      {
        icon: 'backward',
        hotkey: ['Ctrl', <Icon type="arrow-left" />],
        step: -this.props.shiftStep,
        handler: this.handlerTimeShift
      },
      {
        icon: 'step-backward',
        hotkey: [<Icon type="arrow-left" />],
        step: -1,
        handler: this.handlerTimeShift
      },
      {
        icon: this.state.interval ? 'pause' : 'caret-right',
        hotkey: ['Space'],
        step: 1,
        handler: this.handlerPlay
      },
      {
        icon: 'step-forward',
        hotkey: [<Icon type="arrow-right" />],
        step: 1,
        handler: this.handlerTimeShift
      },
      {
        icon: 'forward',
        hotkey: ['Ctrl', <Icon type="arrow-right" />],
        step: this.props.shiftStep,
        handler: this.handlerTimeShift
      },
    ];

    buttons = buttons.map((btn, i) => {
      // ref={(el) => button[buttonName] = el}
      const hotKey = (
        <span key={i} className="hotkey">
          {btn.hotkey.map((item, i) => [i !== 0 && ' + ', <Tag>{item}</Tag>])}
        </span>
      );

      return (
        <Tooltip
          key={i}
          placement="bottom"
          mouseEnterDelay={1}
          title={hotKey}
        >
          <Button
            icon={btn.icon}
            size={this.props.size}
            onClick={(e) => btn.handler(e, btn.step)}
          />
        </Tooltip>
      );
    });

    return (
      <Input.Group size={this.props.size} compact>{buttons}</Input.Group>
    );
  };
}

function mapStateToProps(state) {
  return {
    playDelay: state.main.settings.appPlayDelay,
    shiftStep: state.main.settings.appTimeShiftStep,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainHeaderControls);
