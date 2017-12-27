// @flow
import React, { Component } from 'react';
import { Checkbox, Icon, Popconfirm } from 'antd';


class CheckboxCell extends Component {
  state = {
    value: !!this.props.value,
    isSaved: false,
    error: false
  };
  handleConfirm = () => {
    this.setState({
      value: this.props.value,
      error: false
    });
  }
  handleChange = (e) => {
    const value = e.target.checked;
    if (this.props.onChange) {
      this.setState({
        value,
        isSaved: true
      }, () => {
        this.props.onChange(this.state.value, this.afterAction);
      });
    } else {
      this.setState({ value });
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

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }

  render() {
    const { value, isSaved, error } = this.state;
    const message = error ? (<div>
      <h4>{error.name}</h4>
      <p>{error.message}</p>
                             </div>) : null;

    return (
      <div className={`checkbox-cell ${error ? 'error' : ''}`}>
        {isSaved ?
          <Icon type="loading" />
          :
          <Popconfirm
            title={message}
            visible={!!error}
            placement="bottomLeft"
            overlayClassName="grid-cell-popconfirm"
            onConfirm={this.handleConfirm}
          >
            <Checkbox ref={(el) => this.input = el} checked={value} onChange={this.handleChange} />
          </Popconfirm>
        }
      </div>
    );
  }
}

export default CheckboxCell;
