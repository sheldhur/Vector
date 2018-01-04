import React, { Component } from 'react';
import { Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';
import hexToRgb from 'hex-to-rgb';
import { isHexColor } from '../../utils/helper';

class SettingsInputColor extends Component {
  state = {
    value: this.props.value,
    colorPickerVisible: false,
  };

  isMouseEnter = false;

  componentWillReceiveProps = (nextProps) => {
    if (this.state.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  };

  handlerMouseClick = () => {
    if (!this.isMouseEnter) {
      this.handlerColorPickerCancel();
    }
  };

  handlerColorPickerShow = () => {
    this.setState({ colorPickerVisible: true }, () => {
      document.addEventListener('click', this.handlerMouseClick);
    });
  };

  handlerColorPickerCancel = () => {
    this.setState({
      value: this.props.value,
      colorPickerVisible: false
    }, () => {
      document.removeEventListener('click', this.handlerMouseClick);
    });
  };

  handlerColorChange = (color) => {
    if (color) {
      this.setState({ value: color.rgb });
    } else {
      this.setState({ value: '' });
    }
  };

  handlerChange = (e) => {
    e.persist();
    e.target.value = this.state.value ? this.valueRgbaToString(this.state.value) : '';
    this.setState({ colorPickerVisible: false }, () => this.props.onChange(e));
  };

  valueRgbaToString = (value) => `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;

  valueStringToRgba = (rawValue) => {
    if (!rawValue) {
      return {
        r: 255, g: 255, b: 255, a: 1, isEmpty: true
      };
    }

    if (typeof rawValue === 'string') {
      const value = rawValue.replace(/\s+/, '');
      if (value.startsWith('rgb') || value.startsWith('hsl')) {
        const tmp = value.split('(');
        if (tmp.length >= 2 && tmp[0].length <= 4) {
          tmp[0] = tmp[0].split('');
          tmp[1] = tmp[1].replace(')', '').split(',').map(item => item.trim());

          const result = {};
          tmp[0].forEach((item, i) => {
            result[item] = parseFloat(tmp[1][i]);
          });

          if (!result.hasOwnProperty('a')) {
            result.a = 1;
          }

          return result;
        }
      } else if (isHexColor(value)) {
        const result = hexToRgb(value);
        return { ...result, a: 1 };
      }

      return value;
    }

    return rawValue;
  };

  render = () => {
    const { value, colorPickerVisible } = this.state;

    const rgbaValue = this.valueStringToRgba(value);

    const colorPicker = (
      <div
        onMouseEnter={() => this.isMouseEnter = true}
        onMouseLeave={() => this.isMouseEnter = false}
      >
        <SketchPicker color={rgbaValue} onChangeComplete={this.handlerColorChange} />
        <div style={{ float: 'left' }}>
          <Button size="small" type="primary" onClick={this.handlerChange}>OK</Button>{' '}
          <Button size="small" onClick={this.handlerColorPickerCancel}>Cancel</Button>
        </div>
        <div style={{ float: 'right' }}>
          <Button size="small" onClick={() => this.handlerColorChange()}>Clear</Button>
        </div>
        <div style={{ overflow: 'auto', clear: 'both' }} />
      </div>
    );

    return (
      <Popover
        content={colorPicker}
        visible={colorPickerVisible}
        title="Select color"
        trigger="click"
        placement="right"
      >
        <div
          className="color-input ant-input ant-input-sm"
          onClick={this.handlerColorPickerShow}
          onMouseEnter={() => this.isMouseEnter = true}
          onMouseLeave={() => this.isMouseEnter = false}
        >
          <div style={{ backgroundColor: (!rgbaValue.isEmpty ? this.valueRgbaToString(rgbaValue) : 'transparent') }} />
        </div>
      </Popover>
    );
  };
}

export default SettingsInputColor;
