// @flow
import {remote} from 'electron';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Modal, Icon} from 'antd';
import resourcePath from '../../lib/resourcePath';
import Grid from '../grid/Grid';
import * as uiActions from '../../actions/ui';
import * as dataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';

const {Menu} = remote;


class DataSetGrid extends Component {

  state = {
    availableHeight: 'auto',
    pageSize: 5
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
    }, 300);
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
    if (pageSize > 0) {
      this.setState({availableHeight, pageSize});
    }
  };

  handlerCellChange = (field, id, value, afterAction) => {
    this.props.dataSetActions.updateDataSet(id, {[field]: value}, afterAction);
  };

  handlerRowOnContextMenu = (record, index, e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      return Menu.buildFromTemplate([
        {
          label: 'Delete',
          icon: resourcePath('./assets/icons/blue-folder--minus.png'),
          click: () => {
            Modal.confirm({
              title: 'Delete data set',
              content: 'Are you sure have delete this data set?',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              onOk: () => {
                this.props.dataSetActions.deleteDataSet({id: record.id})
              },
            });
          }
        }, {
          label: 'Clear values',
          icon: resourcePath('./assets/icons/eraser.png'),
          click: () => {
            Modal.confirm({
              title: 'Clear data set values',
              content: 'Are you sure have clear this data set?',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              onOk: () => {
                this.props.dataSetActions.deleteDataSetValue({stationId: record.id})
              },
            });
          }
        }
      ]).popup(remote.getCurrentWindow());
    }
  };

  render() {
    const optionsAxisY = app.DATA_SET_AXIS_Y.map((item) => {
      return {
        value: item.toString().toLowerCase(),
        text: item
      }
    });

    const columns = [
      {
        title: '',
        dataIndex: 'chart',
        width: 30,
        render: (text, record, index) => (<Link to={`/dataset/${record.id}`}><Icon type="line-chart"/></Link>)
      }, {
        title: 'Name',
        dataIndex: 'name',
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('name', record.id, value, afterAction)
        }/>)
      }, {
        title: 'SI',
        dataIndex: 'si',
        width: 75,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('si', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Bad value',
        dataIndex: 'badValue',
        width: 75,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('badValue', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Style',
        dataIndex: 'style',
        width: 75,
        render: (text, record, index) => (<Grid.LineStyleCell value={record.style} onChange={
          (value, afterAction) => this.handlerCellChange('style', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Axis Y',
        dataIndex: 'axisY',
        width: 30,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.SelectCell value={text} options={optionsAxisY} onChange={
          (value, afterAction) => this.handlerCellChange('axisY', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Group',
        dataIndex: 'axisGroup',
        width: 50,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('axisGroup', record.id, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'status',
        width: 30,
        render: (text, record, index) => (<Grid.CheckboxCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('status', record.id, value, afterAction)
        }/>)
      }
    ];


    const {dataSets, isLoading} = this.props.data;
    const data = dataSets ? Object.values(dataSets).filter((dataSet) => dataSet !== undefined) : [];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.uiActions.setGridSelectedRows(selectedRows);
      },
      selections: true
    };

    return (
      <div className="dataset-grid" style={{height: this.state.availableHeight, opacity: (this.state.availableHeight === 'auto' ? 0 : 1)}}>
        <Grid
          ref="grid"
          rowKey="id"
          columns={columns}
          data={data}
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{pageSize: this.state.pageSize}}
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

// export default DataSetGrid;


DataSetGrid.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

DataSetGrid.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    data: state.dataSet,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    dataSetActions: bindActionCreators(dataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetGrid);
