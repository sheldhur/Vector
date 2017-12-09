// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Icon, Popconfirm} from 'antd';
import Grid from '../grid/Grid';
import * as MainActions from '../../actions/main';
import * as DataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';

class DataSetGrid extends Component {

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
  };

  //TODO: may be HOC?
  fixPageSize = () => {
    setTimeout(() => {
      this.calcPageSize();
    }, 300);
  };

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

  handleCellChange = (field, id, value, afterAction) => {
    this.props.dataSetActions.updateDataSet(id, {[field]: value}, afterAction);
  };

  render() {
    let optionsAxisY = app.DATA_SET_AXIS_Y.map((item) => {
      return {
        value: item.toString().toLowerCase(),
        text: item
      }
    });


    let columns = [
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
          (value, afterAction) => this.handleCellChange('name', record.id, value, afterAction)
        }/>)
      }, {
        title: 'SI',
        dataIndex: 'si',
        width: 75,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('si', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Bad value',
        dataIndex: 'badValue',
        width: 75,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('badValue', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Style',
        dataIndex: 'style',
        width: 75,
        render: (text, record, index) => (<Grid.LineStyleCell value={record.style} onChange={
          (value, afterAction) => this.handleCellChange('style', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Axis Y',
        dataIndex: 'axisY',
        width: 30,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.SelectCell value={text} options={optionsAxisY} onChange={
          (value, afterAction) => this.handleCellChange('axisY', record.id, value, afterAction)
        }/>)
      }, {
        title: 'Group',
        dataIndex: 'axisGroup',
        width: 50,
        hasFilter: true,
        hasSorter: true,
        render: (text, record, index) => (<Grid.InputCell value={text} onChange={
          (value, afterAction) => this.handleCellChange('axisGroup', record.id, value, afterAction)
        }/>)
      }, {
        title: '',
        dataIndex: 'status',
        width: 30,
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
            title="Are you sure delete this dataset?"
            onConfirm={() => {this.props.dataSetActions.deleteDataSet({id: record.id})}}
            okText="Delete"
            cancelText="No"
          >
            <a href="#"><Icon type="delete"/></a>
          </Popconfirm>
        )
      }
    ];


    const {dataSets, isLoading} = this.props.data;
    const data = dataSets ? Object.values(dataSets).filter((dataSet) => dataSet !== undefined) : [];

    return (
      <div className="dataset-grid" style={{height: this.state.availableSize}}>
        <Grid
          ref="grid"
          rowKey="id"
          columns={columns}
          data={data}
          loading={isLoading}
          pagination={{pageSize: this.state.pageSize }}
          size="x-small"
          bordered={true}
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
    mainActions: bindActionCreators(MainActions, dispatch),
    dataSetActions: bindActionCreators(DataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetGrid);
