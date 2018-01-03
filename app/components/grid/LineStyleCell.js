// @flow
import React, { Component } from 'react';
import { Icon, Popconfirm, Popover, Button, Form, Input } from 'antd';
import { SketchPicker } from 'react-color';


class LineStyleCell extends Component {
  state = {
    value: this.props.value,
    colorPickerVisible: false,
    isSaved: false,
    error: false,
  };

  isMouseEnter = false;

  componentDidMount = () => {
    document.addEventListener('click', this.handleMouseClick);
  };

  componentWillReceiveProps = (nextProps) => {
    if (JSON.stringify(this.state.value) !== JSON.stringify(nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  };

  componentWillUnmount = () => {
    document.removeEventListener('click', this.handleMouseClick);
  };

  handleMouseClick = () => {
    if (!this.isMouseEnter) {
      this.handleCancel();
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
    this.setState({
      value: {
        ...this.state.value,
        stroke: color.hex
      }
    });
  };

  handleWidthChange = (event) => {
    const value = event.target.value;
    this.setState({
      value: {
        ...this.state.value,
        strokeWidth: value
      }
    });
  };

  handleDasharrayChange = (event) => {
    const value = event.target.value;
    this.setState({
      value: {
        ...this.state.value,
        strokeDasharray: value
      }
    });
  };

  handleColorPickerShow = () => {
    this.setState({ colorPickerVisible: true });
  };

  handleCancel = () => {
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

    const style = {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDasharray: 'none',
      fill: 'none',
      ...value
    };

    const size = 'small';
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const colorPicker = (
      <div
        onMouseEnter={() => this.isMouseEnter = true}
        onMouseLeave={() => this.isMouseEnter = false}
      >
        <div className="line-style-control">
          <div className="left">
            <SketchPicker disableAlpha color={style.stroke} onChangeComplete={this.handleColorChange} />
          </div>
          <div className="right">
            <Form layout="horizontal">
              <Form.Item label="Width" {...formItemLayout}>
                <Input
                  value={style.strokeWidth}
                  onChange={this.handleWidthChange}
                  size={size}
                />
              </Form.Item>
              <Form.Item
                label="Dash"
                help={(<span>Example: <strong><u>5,10,5</u></strong> or <strong><u>none</u></strong></span>)}
                {...formItemLayout}
              >
                <Input
                  value={style.strokeDasharray}
                  onChange={this.handleDasharrayChange}
                  size={size}
                />
              </Form.Item>
            </Form>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="190"
              height="160"
              version="1.1"
            >
              <path d="M10 80  C 40 10, 65 10, 95 80 S 150 150, 180 80" {...style} />
            </svg>
            <div>
              <Button size="small" type="primary" onClick={this.handleChange}>OK</Button>{' '}
              <Button size="small" onClick={this.handleCancel}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div
        className="line-style-cell"
        onMouseEnter={() => this.isMouseEnter = true}
        onMouseLeave={() => this.isMouseEnter = false}
      >
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
            title="Select line style"
            trigger="click"
            placement="right"
          >
            <div className="line-style-cell-wrapper" onClick={!isSaved ? this.handleColorPickerShow : null}>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="75"
                  height="16"
                  version="1.1"
                  shapeRendering="optimizeSpeed"
                >
                  <line
                    x1="0%"
                    y1="50%"
                    x2="100%"
                    y2="50%"
                    {...style}
                  />
                </svg>
              </div>
              {isSaved ?
                <Icon type="loading" className="line-style-cell-icon" />
                :
                <Icon type="line-chart" className="line-style-cell-icon" />
              }
            </div>
          </Popover>
        </Popconfirm>
      </div>
    );
  }
}

export default LineStyleCell;
