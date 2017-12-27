// @flow
import {remote} from 'electron';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {Modal} from 'antd';
import resourcePath from '../../lib/resourcePath';
import Grid from '../grid/Grid';
import * as uiActions from '../../actions/ui';
import * as dataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';

const {Menu} = remote;


class DataSetValuesGrid extends Component {

  state = {
    availableHeight: 'auto',
    pageSize: 5,
    pageCurrent: null,
  };

  componentDidMount = () => {
    this.setPagination(this.props);
    window.addEventListener('resize', this.handlerResize);
    window.addEventListener('load', this.fixPageSize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handlerResize);
    window.removeEventListener('load', this.fixPageSize);

    this.props.uiActions.setGridSelectedRows(null);
  };

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      pageCurrent: this.calcPageCurrent(nextProps, this.state.pageSize)
    });
  };

  handlerResize = () => {
    const {pageSize, availableHeight} = this.calcPageSize();
    this.setState({
      availableHeight,
      pageSize,
    });
  };

  fixPageSize = () => {
    setTimeout(() => this.setPagination(this.props), 300);
  };

  setPagination = (props) => {
    const {availableHeight, pageSize} = this.calcPageSize();
    const pageCurrent = this.calcPageCurrent(props, pageSize);
    this.setState({
      availableHeight,
      pageSize,
      pageCurrent,
    })
  };

  calcPageCurrent = (props, pageSize) => {
    const {dataSetValues, dataSetId, currentTime} = props;
    const data = dataSetValues[dataSetId] || [];
    const currentTimeStr = moment(currentTime).format(app.FORMAT_DATE_SQL);

    let currentPage = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].time === currentTimeStr) {
        currentPage = Math.floor(i / pageSize) + 1;
        break;
      }
    }

    return currentPage;
  };

  calcPageSize = () => {
    const grid = ReactDOM.findDOMNode(this.refs.grid);
    const pagination = grid.querySelector('.ant-pagination');

    const theadHeight = grid.querySelector('thead').clientHeight || 0;
    const paginationHeight = pagination ? pagination.clientHeight : 0;
    const row = grid.querySelector('tbody > tr');
    const rowHeight = row ? row.offsetHeight : 28;
    const availableHeight = window.innerHeight - grid.getBoundingClientRect().top;

    const pageSize = Math.floor((availableHeight - theadHeight - (paginationHeight + 16 * 2)) / rowHeight);

    return {availableHeight, pageSize};
  };

  handlerPageChange = (pageCurrent) => {
    this.setState({pageCurrent});
  };

  handlerCellChange = (field, id, value, afterAction) => {
    this.props.dataSetActions.updateDataSetValue(id, {[field]: value}, afterAction);
  };

  handlerRowOnContextMenu = (record, index, e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      return Menu.buildFromTemplate([{
        label: 'Delete value',
        icon: resourcePath('./assets/icons/table-delete-row.png'),
        click: () => this.props.dataSetActions.deleteDataSetValue({id: record.id})
      }]).popup(remote.getCurrentWindow());
    }
  };

  render = () => {
    const columns = [{
      title: 'Time',
      dataIndex: 'time',
      hasFilter: true,
      hasSorter: true,
      onCell: (record) => ({
        onClick: () => this.props.uiActions.setChartCurrentTime(new Date(record.time))
      }),
    }, {
      title: 'Value',
      dataIndex: 'value',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
        (value, afterAction) => this.handlerCellChange('value', record.id, value, afterAction)
      }/>),
      width: 175
    }, {
      title: '',
      dataIndex: 'format',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => {
        return app.VALUES_CONVERT_FORMAT[text];
      },
      width: 80
    }];


    const {dataSetValues, dataSetId, isLoading, currentTime} = this.props;
    const currentTimeStr = moment(currentTime).format(app.FORMAT_DATE_SQL);
    const data = dataSetValues[dataSetId] || [];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.uiActions.setGridSelectedRows(selectedRows);
      },
      selections: true
    };

    return (
      <div style={{height: this.state.availableHeight}}>
        <Grid
          rowClassName={(record) => {
            return record.time === currentTimeStr ? 'select-row' : ''
          }}
          ref="grid"
          rowKey="id"
          columns={columns}
          data={data}
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: this.state.pageSize,
            showQuickJumper: true,
            current: this.state.pageCurrent,
            onChange: this.handlerPageChange
          }}
          size="x-small"
          bordered={true}
          onRow={(record, index) => ({
            onContextMenu: (event) => this.handlerRowOnContextMenu(record, index, event)
          })}
        />
      </div>
    );
  };
}

DataSetValuesGrid.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

DataSetValuesGrid.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    isLoading: state.dataSet.isLoading,
    dataSetValues: state.dataSet.dataSetValues,
    currentTime: state.ui.chartCurrentTime
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    dataSetActions: bindActionCreators(dataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetValuesGrid);
