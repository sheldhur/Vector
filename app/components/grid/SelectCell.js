// @flow
import React, {Component} from 'react';
import {Select, Icon, Popconfirm} from 'antd';
import HighlightValue from './HighlightValue';


class SelectCell extends Component {

  state = {
    value: this.props.value,
    isSaved: false,
    error: false
  };

  componentWillReceiveProps(nextProps) {
    const {value} = this.state;
    const isUpdate = nextProps.value && nextProps.value.hasOwnProperty('search') ?
      (value.text !== nextProps.value || value.search !== nextProps.search) :
      (value !== nextProps.value);

    if (isUpdate) {
      this.setState({
        value: nextProps.value
      });
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
      }, () => {
        if (this.props.value && this.props.value.hasOwnProperty('updateFilter')) {
          this.props.value.updateFilter();
        }
      });
    }
  };

  render() {
    const {value, isSaved, error} = this.state;
    const message = !!error ? <div>
      <h4>{error.name}</h4>
      <p>{error.message}</p>
    </div> : null;

    let plainValue = null;
    let search = null;
    if (value && value.hasOwnProperty('text')) {
      plainValue = value.text;
      search = value.search;
    } else {
      plainValue = value
    }

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
            ref={(el) => this.input = el}
            value={plainValue}
            onChange={this.handleChange}
            size="small"
            dropdownMatchSelectWidth={false}
            style={{width: '100%'}}
          >
            {this.props.options.map((item, i) => {
              let key = item.value || i;
              return (
                <Select.Option key={key} value={key}>
                  <HighlightValue value={item.text || item} search={search}/>
                </Select.Option>
              );
            })}
          </Select>
        </Popconfirm>
      </div>
    );
  }
}

export default SelectCell;
