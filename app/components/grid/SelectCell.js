// @flow
import React, {Component, PropTypes} from 'react';
import {Select, Icon, Popconfirm} from 'antd';


class SelectCell extends Component {

  state = {
    value: this.props.value,
    isSaved: false,
    error: false
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({value: nextProps.value});
    }
  }

  handleConfirm = () => {
    this.setState({
      value: this.props.value,
      error: false
    });
  };

  handleChange = (value) => {
    if (this.props.onChange) {
      this.setState({
        value,
        isSaved: true
      }, () => {
        this.props.onChange(this.state.value, this.afterAction)
      });
    } else {
      this.setState({value});
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

  render() {
    const {value, isSaved, error} = this.state;
    const message = !!error ? <div>
      <h4>{error.name}</h4>
      <p>{error.message}</p>
    </div> : null;

    return (
      <div className={"select-cell" + (error ? ' error' : '') + (isSaved ? ' saved' : '')}>
        <Popconfirm
          title={message}
          visible={!!error}
          placement="bottomLeft"
          overlayClassName="grid-cell-popconfirm"
          onConfirm={this.handleConfirm}
        >
          <Select
            ref={(el) => this.input = el} value={value}
            onChange={this.handleChange}
            size="small"
            dropdownMatchSelectWidth={false}
            style={{width: '100%'}}
          >
            {this.props.options.map((item, i) => {
              let key = item.value || i;
              return <Select.Option key={key} value={key}>{item.text || item}</Select.Option>
            })}
          </Select>
        </Popconfirm>
      </div>
    );
  }
}

export default SelectCell;
