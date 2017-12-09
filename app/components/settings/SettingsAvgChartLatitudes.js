// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Popconfirm, Icon} from 'antd';
import Grid from './../grid/Grid';
import * as app from './../../constants/app';

class SettingsAvgChartLines extends Component {

  handleCellChange = (field, index, value, afterAction) => {
    this.props.onCellChange(field, index, value);
    afterAction(true);
    // this.props.dataSetActions.updateDataSetValue(id, {[field]: value}, afterAction);
  };

  handleLineAddRemove = (index) => {
    if (Number.isInteger(index)) {
      this.props.onLineRemove(index);
    } else if (!index) {
      this.props.onLineAdd();
    }
  };

  render() {
    let columns = [
      {
        title: 'Start',
        dataIndex: '0',
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('0', index, value, afterAction)
        }/>)
      }, {
        title: 'End',
        dataIndex: '1',
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('1', index, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'delete',
        width: 30,
        render: (text, record, index) => {
          return (
            (record[0] && record[1]) ?
              <Popconfirm
                placement="left"
                title="Are you sure delete this range?"
                onConfirm={() => {this.handleLineAddRemove(index)}}
                okText="Delete"
                cancelText="No"
              >
                <a href="#"><Icon type="delete"/></a>
              </Popconfirm>
              :
              <a href="#" onClick={() => {this.handleLineAddRemove(index)}}><Icon type="delete"/></a>
          )
        }
      }
    ];

    const {value} = this.props;
    const lines = value ? value.map((line, i) => {
      return {0: line[0], 1: line[1], key: i}
    }) : [];
    // const buttonAddDisable = !!lines.filter((line) => !line.comp || !line.hemisphere).length;
    const buttonAddDisable = false;

    const footer = (
      <div>
        <Button
          icon="plus-square"
          size="small"
          onClick={() => this.handleLineAddRemove()}
          disabled={buttonAddDisable}
        >
          Add range
        </Button>
      </div>
    );

    return (
      <Grid
        ref="grid"
        columns={columns}
        footer={() => footer}
        data={lines}
        pagination={false}
        size="x-small"
        bordered={true}
      />
    );
  }
}

// export default DataSetGrid;


SettingsAvgChartLines.propTypes = {
  onCellChange: PropTypes.func,
  onLineAdd: PropTypes.func,
  onLineRemove: PropTypes.func,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

SettingsAvgChartLines.defaultProps = {
  onCellChange: null,
  onLineAdd: null,
  onLineRemove: null,
  width: '100%',
  height: '100%',
};

export default SettingsAvgChartLines;
