// @flow
import {remote} from 'electron';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Icon, Modal} from 'antd';
import resourcePath from '../../lib/resourcePath';
import Grid from '../grid/Grid';
import * as uiActions from '../../actions/ui';
import * as stationActions from '../../actions/station';

const {Menu} = remote;


class StationGrid extends Component {

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

    this.props.uiActions.setGridSelectedRows(null);
  };

  fixPageSize = () => {
    setTimeout(() => {
      this.calcPageSize();
    }, 300);
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

  handlerCellChange = (field, id, value, afterAction) => {
    this.props.stationActions.updateStation(id, {[field]: value}, afterAction);
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
              title: 'Delete station',
              content: 'Are you sure have delete this station?',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              onOk: () => {
                this.props.stationActions.deleteStation({id: record.id})
              },
            });
          }
        }, {
          label: 'Clear values',
          icon: resourcePath('./assets/icons/eraser.png'),
          click: () => {
            Modal.confirm({
              title: 'Clear station values',
              content: 'Are you sure have clear this station?',
              okText: 'Yes',
              okType: 'danger',
              cancelText: 'No',
              onOk: () => {
                this.props.stationActions.deleteStationValue({stationId: record.id})
              },
            });
          }
        }
      ]).popup(remote.getCurrentWindow());
    }
  };

  render() {
    const columns = [
      {
        title: '',
        dataIndex: 'chart',
        width: 30,
        render: (text, record, index) => (<Link to={`/station/${record.id}`}><Icon type="line-chart"/></Link>)
      }, {
        title: 'Name',
        dataIndex: 'name',
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('name', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Source',
        dataIndex: 'source',
        width: 150,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('source', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Lat',
        dataIndex: 'latitude',
        width: 150,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('latitude', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Long',
        dataIndex: 'longitude',
        width: 150,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('longitude', record.id, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'status',
        width: 30,
        hasSorter: true,
        render: (text, record, index) => (<Grid.CheckboxCell value={text} onChange={
          (value, afterAction) => this.handlerCellChange('status', record.id, value, afterAction)
        }/>)
      }
    ];

    const {values, isLoading} = this.props;
    const data = values ? Object.values(values).filter((station) => station !== undefined) : [];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.uiActions.setGridSelectedRows(selectedRows);
      },
      selections: true
    };

    return (
      <div style={{height: this.state.availableHeight}}>
        <Grid
          ref="grid"
          rowKey="id"
          columns={columns}
          data={data}
          loading={isLoading}
          rowSelection={rowSelection}
          pagination={{size: 'small', pageSize: this.state.pageSize}}
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
    values: state.station.stations,
    isLoading: state.station.isLoading
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    stationActions: bindActionCreators(stationActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationGrid);
