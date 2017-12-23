// @flow
import {remote} from 'electron';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Icon, Popconfirm} from 'antd';
import moment from 'moment';
import resourcePath from '../../lib/resourcePath';
import Grid from '../grid/Grid';
import * as uiActions from '../../actions/ui';
import * as stationActions from '../../actions/station';
import * as app from '../../constants/app';

const {Menu} = remote;


class StationGrid extends Component {

  state = {
    availableHeight: 'auto',
    pageSize: 5,
    pageCurrent: null,
  };

  componentDidMount = () => {
    window.addEventListener('resize', this.calcPageSize);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.calcPageSize);
  };

  componentWillReceiveProps = (nextProps) => {
    if (!nextProps.isLoading) {
      if (this.state.availableHeight === 'auto') {
        setTimeout(() => {
          this.calcPageSize();
        }, 100);
      }
      this.setState({pageCurrent: this.calcPageCurrent(nextProps)});
    }
  };

  calcPageCurrent = (props) => {
    const {values, currentTime} = props;
    const data = values ? Object.values(values) : [];
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
    const grid = ReactDOM.findDOMNode(this.refs.grid);
    const pagination = grid.querySelector('.ant-pagination');

    const theadHeight = grid.querySelector('thead').clientHeight || 0;
    const paginationHeight = pagination ? pagination.clientHeight : 0;
    const row = grid.querySelector('tbody > tr');
    const rowHeight = row ? row.offsetHeight : 28;
    const availableHeight = window.innerHeight - grid.getBoundingClientRect().top;

    const pageSize = Math.floor((availableHeight - theadHeight - (paginationHeight + 16 * 2)) / rowHeight);
    if (pageSize > 0) {
      this.setState({availableHeight, pageSize});
    }
  };

  handlerPageChange = (page) => {
    this.setState({pageCurrent: page});
  };

  handlerCellChange = (field, id, value, afterAction) => {
    console.log(id, {[field]: value});
    if (['compX', 'compY', 'compZ'].indexOf(field) !== -1 && value.trim() === '') {
      value = null;
    }
    this.props.stationActions.updateStationValue(id, {[field]: value}, afterAction);
  };

  handlerRowOnContextMenu = (record, index, e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      return Menu.buildFromTemplate([
        {
          label: 'Clear values',
          icon: resourcePath('./assets/icons/eraser.png'),
          click: () => this.props.stationActions.updateStationValue(record.id, {
            compX: null,
            compY: null,
            compZ: null
          })
        }, {
          label: 'Delete values',
          icon: resourcePath('./assets/icons/table-delete-row.png'),
          click: () => this.props.stationActions.deleteStationValue({id: record.id})
        }
      ]).popup(remote.getCurrentWindow());
    }
  };

  render() {
    const compWidth = 165;
    const columns = [{
      title: 'Time',
      dataIndex: 'time',
      hasFilter: true,
      hasSorter: true,
      onCell: (record) => ({
        onClick: () => this.props.uiActions.setChartCurrentTime(new Date(record.time))
      }),
    }, {
      title: 'X',
      dataIndex: 'compX',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
        (value, afterAction) => this.handlerCellChange('compX', record.id, value, afterAction)
      }/>),
      width: compWidth
    }, {
      title: 'Y',
      dataIndex: 'compY',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
        (value, afterAction) => this.handlerCellChange('compY', record.id, value, afterAction)
      }/>),
      width: compWidth
    }, {
      title: 'Z',
      dataIndex: 'compZ',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
        (value, afterAction) => this.handlerCellChange('compZ', record.id, value, afterAction)
      }/>),
      width: compWidth
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

    const {values, isLoading, currentTime} = this.props;
    const currentTimeStr = moment(currentTime).format(app.FORMAT_DATE_SQL);
    const data = values ? Object.values(values) : [];

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
  }
}

StationGrid.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

StationGrid.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    values: state.station.stationView.values,
    isLoading: state.station.stationView.isLoading,
    currentTime: state.ui.chartCurrentTime,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    stationActions: bindActionCreators(stationActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationGrid);
