// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import Grid from '../grid/Grid';
import * as ChartActions from '../../actions/chart';
import * as StationActions from '../../actions/station';
import * as app from '../../constants/app';

class StationGrid extends Component {

  state = {
    availableSize: 'auto',
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
      if (this.state.availableSize === 'auto') {
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
    console.log(id, {[field]: value});
    if (['compX', 'compY', 'compZ'].indexOf(field) !== -1 && value.trim() === '') {
      value = null;
    }
    this.props.stationActions.updateStationValue(id, {[field]: value}, afterAction);
  };

  render() {
    const compWidth = 165;
    const columns = [{
      title: 'Time',
      dataIndex: 'time',
      hasFilter: true,
      hasSorter: true,
      onCellClick: (record, event) => {
        this.props.chartActions.setChartCurrentTime(new Date(record.time));
      }
    }, {
      title: 'X',
      dataIndex: 'compX',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('compX', record.id, value, afterAction)
        }/>),
      width: compWidth
    }, {
      title: 'Y',
      dataIndex: 'compY',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('compY', record.id, value, afterAction)
        }/>),
      width: compWidth
    }, {
      title: 'Z',
      dataIndex: 'compZ',
      hasFilter: true,
      hasSorter: true,
      render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('compZ', record.id, value, afterAction)
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

    let data = values ? Object.values(values) : [];

    return (
      <div style={{height: this.state.availableSize}}>
        <Grid
          rowClassName = {(record) => {return record.time === currentTimeStr ? 'select-row' : ''}}
          ref="grid"
          rowKey="id"
          columns={columns}
          data={data}
          loading={isLoading}
          pagination={{pageSize: this.state.pageSize, showQuickJumper: true, current: this.state.pageCurrent, onChange: this.handlerPageChange}}
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
    values: state.station.stationView.values,
    isLoading: state.station.stationView.isLoading,
    currentTime: state.chart.chartCurrentTime,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    chartActions: bindActionCreators(ChartActions, dispatch),
    stationActions: bindActionCreators(StationActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationGrid);
