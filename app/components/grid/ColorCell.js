import React, { Component } from 'react';
import { Icon, Popconfirm, Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';


class ColorCell extends Component {
  state = {
    value: this.props.value,
    colorPickerVisible: false,
    isSaved: false,
    error: false
  };

  componentWillReceiveProps = (nextProps) => {
    if (this.state.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  };

  handleConfirm = () => {
    this.setState({
      value: this.props.value,
      error: false
    });
  };

  handleChange = () => {
    if (this.props.onChange) {
      this.setState({
        colorPickerVisible: false,
        isSaved: true
      }, () => {
        this.props.onChange(this.state.value, this.afterAction);
      });
    } else {
      this.setState({
        colorPickerVisible: false,
      });
    }
  };

  afterAction = (value) => {
    if (value.error !== undefined) {
      this.setState({
        isSaved: false,
        error: value.error,
      });
    } else {
      this.setState({
        isSaved: false,
      });
    }
  };

  handleColorChange = (color) => {
    this.setState({ value: color.hex });
  };

  handleColorPickerShow = () => {
    this.setState({ colorPickerVisible: true });
  };

  handleColorPickerCancel = () => {
    this.setState({
      value: this.props.value,
      colorPickerVisible: false
    });
  };

  render = () => {
    const {
      value, colorPickerVisible, isSaved, error
    } = this.state;
    const message = error ? (<div>
      <h4>{error.name}</h4>
      <p>{error.message}</p>
    </div>) : null;

    const colorPicker = (
      <div>
        <SketchPicker disableAlpha color={value || '#FFFFFF'} onChangeComplete={this.handleColorChange} />
        <div style={{ textAlign: 'center' }}>
          <Button size="small" type="primary" onClick={this.handleChange}>OK</Button>{' '}
          <Button size="small" onClick={this.handleColorPickerCancel}>Cancel</Button>
        </div>
      </div>
    );

    return (
      <div className="color-cell">
        <Popconfirm
          title={message}
          visible={!!error}
          placement="bottomLeft"
          overlayClassName="grid-cell-popconfirm"
          onConfirm={this.handleConfirm}
        >
          <Popover
            content={colorPicker}
            visible={colorPickerVisible}
            title="Select color"
            trigger="click"
            placement="right"
          >
            <div className="color-cell-wrapper" onClick={!isSaved ? this.handleColorPickerShow : null}>
              <div style={{ backgroundColor: value && value !== '' ? value : 'transparent' }} />
              {isSaved ?
                <Icon type="loading" className="color-cell-icon" />
                :
                <Icon type="edit" className="color-cell-icon" />
              }
            </div>
          </Popover>
        </Popconfirm>
      </div>
    );
  };
}

export default ColorCell;
