// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Icon, Popconfirm} from 'antd';
import Grid from '../grid/Grid';
import * as uiActions from '../../actions/ui';
import * as stationActions from '../../actions/station';


class StationGrid extends Component {

  state = {
    availableSize: 'auto',
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
    let grid = ReactDOM.findDOMNode(this.refs.grid);
    let pagination = grid.querySelector('.ant-pagination');

    let theadHeight = grid.querySelector('thead').clientHeight || 0;
    let paginationHeight = pagination ? pagination.clientHeight : 0;
    let row = grid.querySelector('tbody > tr');
    let rowHeight = row ? row.offsetHeight : 25;
    let availableSize = window.innerHeight - grid.getBoundingClientRect().top;

    let pageSize = Math.floor((availableSize - theadHeight - (paginationHeight + 16 * 2)) / rowHeight);
    if (pageSize > 0) {
      this.setState({availableSize, pageSize});
    }
  };

  handleCellChange = (field, id, value, afterAction) => {
    this.props.stationActions.updateStation(id, {[field]: value}, afterAction);
  };

  render() {
    let columns = [
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
          (value, afterAction) => this.handleCellChange('name', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Source',
        dataIndex: 'source',
        width: 150,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('source', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Lat',
        dataIndex: 'latitude',
        width: 150,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('latitude', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Long',
        dataIndex: 'longitude',
        width: 150,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('longitude', record.id, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'status',
        width: 30,
        hasSorter: true,
        render: (text, record, index) => (<Grid.CheckboxCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('status', record.id, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'delete',
        width: 30,
        render: (text, record, index) => (
          <Popconfirm
            placement="left"
            title="Are you sure delete this station?"
            onConfirm={() => {
              this.props.stationActions.deleteStation({id: record.id})
            }}
            okText="Yes"
            cancelText="No"
          >
            <a href="#"><Icon type="delete"/></a>
          </Popconfirm>
        )
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
      <div style={{height: this.state.availableSize}}>
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
