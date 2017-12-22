// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';
import {Icon, Popconfirm, Table} from 'antd';
import Grid from '../grid/Grid';
import * as uiActions from '../../actions/ui';
import * as dataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';

class DataSetValuesGrid extends Component {

  state = {
    availableSize: 'auto',
    pageSize: 5,
    pageCurrent: null,
  };

  componentDidMount = () => {
    this.calcPageSize();
    window.addEventListener('resize', this.calcPageSize);
    window.addEventListener('load', this.fixPageSize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.calcPageSize);
    window.removeEventListener('load', this.fixPageSize);
  };

  //TODO: may be HOC?
  fixPageSize = () => {
    setTimeout(() => {
      this.calcPageSize();
    }, 100);
  };

  componentWillReceiveProps = (nextProps) => {
    if (this.state.availableSize === 'auto') {
      setTimeout(() => {
        this.calcPageSize();
      }, 100);
    }
    this.setState({pageCurrent: this.calcPageCurrent(nextProps)});
  };

  calcPageCurrent = (props) => {
    const {dataSetValues, dataSetId, currentTime} = props;
    const data = dataSetValues[dataSetId] || [];
    const currentTimeStr = moment(currentTime).format(app.FORMAT_DATE_SQL);
    let currentPage = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].time === currentTimeStr) {
        currentPage = Math.floor(i / this.state.pageSize) + 1;
        break;
      }
    }

    return currentPage;
  };

  //TODO: прибить пагинатор к низу
  calcPageSize = () => {
    let grid = ReactDOM.findDOMNode(this.refs.grid);
    let pagination = grid.querySelector('.ant-pagination');

    let theadHeight = grid.querySelector('thead').clientHeight || 0;
    let paginationHeight = pagination ? pagination.clientHeight : 0;
    let row = grid.querySelector('tbody > tr');
    let availableSize = window.innerHeight - grid.getBoundingClientRect().top;

    if (row) {
      let pageSize = Math.floor((availableSize - theadHeight - (paginationHeight + 16 * 2)) / row.offsetHeight);
      if (pageSize > 0) {
        this.setState({availableSize, pageSize});
      }
    }
  };

  handlerPageChange = (page) => {
    this.setState({pageCurrent: page});
  };

  handleCellChange = (field, id, value, afterAction) => {
    console.log({[field]: value});
    this.props.dataSetActions.updateDataSetValue(id, {[field]: value}, afterAction);
  };

  render() {
    let columns = [{
      title: 'Time',
      dataIndex: 'time',
      hasFilter: true,
      hasSorter: true,
      onCellClick: (record, event) => {
        this.props.uiActions.setChartCurrentTime(new Date(record.time));
      }
    }, {
      title: 'Value',
      dataIndex: 'value',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
        (value, afterAction) => this.handleCellChange('value', record.id, value, afterAction)
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
    }, {
      title: '',
      dataIndex: 'delete',
      width: 30,
      render: (text, record, index) => (
        <Popconfirm
          placement="left"
          title="Are you sure delete this station?"
          onConfirm={() => {
            this.props.dataSetActions.deleteDataSetValue({id: record.id})
          }}
          okText="Yes"
          cancelText="No"
        >
          <a href="#"><Icon type="delete"/></a>
        </Popconfirm>
      )
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
      <div style={{height: this.state.availableSize}}>
        <Grid
          rowClassName = {(record) => {return record.time === currentTimeStr ? 'select-row' : ''}}
          ref="grid"
          rowKey="id"
          columns={columns}
          data={data}
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{pageSize: this.state.pageSize, showQuickJumper: true, current: this.state.pageCurrent, onChange: this.handlerPageChange}}
          size="x-small"
          bordered={true}
        />
      </div>
    );
  }
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
    dataSetValues: state.dataSet.dataSetValues,
    currentTime: state.ui.chartCurrentTime ? new Date(state.ui.chartCurrentTime) : null
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    dataSetActions: bindActionCreators(dataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetValuesGrid);
