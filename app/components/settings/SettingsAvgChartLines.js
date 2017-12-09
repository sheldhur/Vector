// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Popconfirm, Icon} from 'antd';
import Grid from '../grid/Grid';
import * as app from '../../constants/app';

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
    const optionsComp = app.AVG_CHART_COMP.map((item) => {
      return {
        value: item,
        text: item.replace(/^d/, 'Δ')
      }
    });
    const optionsHemisphere = app.AVG_CHART_HEMISPHERE.map((item) => {
      return {
        value: item,
        text: item
      }
    });

    let columns = [
      {
        title: 'Comp',
        dataIndex: 'comp',
        render: (text, record, index) => (<Grid.SelectCell value={text} options={optionsComp} onChange={
          (value, afterAction) => this.handleCellChange('comp', index, value, afterAction)
        }/>)
      }, {
        title: 'Hemisphere',
        dataIndex: 'hemisphere',
        render: (text, record, index) => (<Grid.SelectCell value={text} options={optionsHemisphere} onChange={
          (value, afterAction) => this.handleCellChange('hemisphere', index, value, afterAction)
        }/>)
      }, {
        title: 'Style',
        dataIndex: 'style',
        width: 75,
        render: (text, record, index) => (<Grid.LineStyleCell value={record.style} onChange={
          (value, afterAction) => this.handleCellChange('style', index, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'enabled',
        width: 30,
        render: (text, record, index) => (<Grid.CheckboxCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('enabled', index, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'delete',
        width: 30,
        render: (text, record, index) => {
          return (
            (record.comp && record.hemisphere) ?
              <Popconfirm
                placement="left"
                title="Are you sure delete this line?"
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
      return {...line, key: i}
    }) : [];
    const buttonAddDisable = !!lines.filter((line) => !line.comp || !line.hemisphere).length;

    const footer = (
      <div>
        <Button
          icon="plus-square"
          size="small"
          onClick={() => this.handleLineAddRemove()}
          disabled={buttonAddDisable}
        >
          Add line
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
