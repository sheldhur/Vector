import React, { Component } from 'react';
import { Input, Icon, Popconfirm } from 'antd';
import HighlightValue from './HighlightValue';


const ESCAPE_KEY = 27;

class InputCell extends Component {
  state = {
    value: this.props.value,
    editable: false,
    isSaved: false,
    error: false
  };

  componentWillReceiveProps = (nextProps) => {
    const { value } = this.state;
    const isUpdate = nextProps.value && nextProps.value.hasOwnProperty('search') ?
      (value.text !== nextProps.value || value.search !== nextProps.search) :
      (value !== nextProps.value);

    if (isUpdate) {
      this.setState({
        value: nextProps.value
      });
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.editable) {
      this.input.focus();
    }
  };

  handleEdit = () => {
    this.setState({ editable: true });
  };

  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
  };

  handleKeyDown = (e) => {
    if (e.keyCode === ESCAPE_KEY) {
      this.handleUndo();
    }
  };

  handleUndo = () => {
    this.setState({
      value: this.props.value,
      isSaved: false,
      error: false,
      editable: false,
    });
  };

  handleConfirm = () => {
    this.setState({
      error: false
    }, () => this.input.focus());
  };

  handleCheck = () => {
    if (this.props.onChange && this.props.value !== this.state.value) {
      if (!this.state.error) {
        this.setState({ isSaved: true }, () => {
          this.props.onChange(this.state.value, (value) => this.afterAction(value));
        });
      }
    } else {
      this.setState({ editable: false });
    }
  };

  afterAction = (value) => {
    if (value.error !== undefined) {
      this.setState({
        editable: true,
        isSaved: false,
        error: value.error,
      });
    } else {
      this.setState({
        editable: false,
        isSaved: false,
      }, () => {
        if (this.props.value && this.props.value.hasOwnProperty('updateFilter')) {
          this.props.value.updateFilter();
        }
      });
    }
  };

  render = () => {
    const {
      value, editable, isSaved, error
    } = this.state;
    const message = error ? (<div>
      <h4>{error.name}</h4>
      <p>{error.message}</p>
    </div>) : null;

    let plainValue = null;
    let search = null;
    if (value && value.hasOwnProperty('text')) {
      plainValue = value.text;
      search = value.search;
    } else {
      plainValue = value;
    }

    return (
      <div className="input-cell">
        {editable ?
          <div className={`input-cell-input-wrapper ${error ? 'error' : ''}`}>
            <Popconfirm
              title={message}
              visible={!!error}
              placement="bottomLeft"
              cancelText="Undo"
              onCancel={this.handleUndo}
              onConfirm={this.handleConfirm}
            >
              <Input
                ref={(el) => this.input = el}
                value={plainValue}
                disabled={isSaved}
                onChange={!isSaved ? this.handleChange : null}
                onPressEnter={!isSaved ? this.handleCheck : null}
                onBlur={!isSaved ? this.handleCheck : null}
                onKeyDown={!isSaved ? this.handleKeyDown : null}
              />
              <Icon type={isSaved ? 'loading' : 'edit'} className="input-cell-icon" />
              <div className="input-cell-underline">
                <hr />
              </div>
            </Popconfirm>
          </div>
          :
          <div className="input-cell-text-wrapper" onDoubleClick={this.handleEdit}>
            <HighlightValue value={plainValue} search={search} />&nbsp;
            <Icon type="edit" className="input-cell-icon" onClick={this.handleEdit} />
          </div>
        }
      </div>
    );
  }
}

export default InputCell;
