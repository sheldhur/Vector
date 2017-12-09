// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Popconfirm, Icon} from 'antd';
import Grid from './../grid/Grid';
import * as app from './../../constants/app';

class MagnetopauseSettingsDataSets extends Component {

  handleCellChange = (field, index, value, afterAction) => {
    this.props.onCellChange(field, index, value);
    afterAction(true);
    // this.props.dataSetActions.updateDataSetValue(id, {[field]: value}, afterAction);
  };

  handleLineAddRemove = (e, index) => {
    e.preventDefault();

    if (Number.isInteger(index)) {
      this.props.onLineRemove(index);
    } else if (!index) {
      this.props.onLineAdd();
    }
  };

  render() {
    const {value, dataSets} = this.props;

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        render: (text, record, index) => (record.name + (record.si ? ` (${record.si})` : null))
      }, {
        dataIndex: 'id',
        key: 'id',
        width: 30,
        render: (text, record, index) => (
          <a href="#" onClick={(e) => {this.handleLineAddRemove(e, index)}}><Icon type="delete"/></a>
        )
      }
    ];

    const lines = dataSets ? dataSets
      .filter(line => (value.indexOf(line.id) !== -1))
      .map((line, i) => {
        return {...line, key: i}
      }) : [];

    return (
      <Grid
        ref="grid"
        columns={columns}
        data={lines}
        pagination={false}
        size="x-small"
        bordered={false}
        showHeader={false}
      />
    );
  }
}

MagnetopauseSettingsDataSets.propTypes = {
  onCellChange: PropTypes.func,
  onLineAdd: PropTypes.func,
  onLineRemove: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

MagnetopauseSettingsDataSets.defaultProps = {
  onCellChange: null,
  onLineAdd: null,
  onLineRemove: null,
  width: '100%',
  height: '100%',
};

export default MagnetopauseSettingsDataSets;
