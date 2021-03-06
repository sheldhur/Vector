// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Col, Button, Select, Menu, Dropdown, Icon, Modal } from 'antd';
import * as dataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';


const DATASET_DISABLE = 'DATASET_DISABLE';
const DATASET_ENABLE = 'DATASET_ENABLE';
const DATASET_DELETE = 'DATASET_DELETE';
const DATASET_DELETE_SELECTED_VALUES = 'DATASET_DELETE_SELECTED_VALUES';
const DATASET_DELETE_ALL_VALUES = 'DATASET_DELETE_ALL_VALUES';

class DataSetValueActions extends Component {
  handlerStationChange = (dataSetId) => {
    this.props.history.push(`/dataSet/${dataSetId}`);
  };

  handlerActionSelect = (e) => {
    const { dataSetId } = this.props;
    switch (e.key) {
      case DATASET_DISABLE:
        this.props.dataSetActions.updateDataSet(dataSetId, { status: app.STATION_DISABLED });
        break;
      case DATASET_ENABLE:
        this.props.dataSetActions.updateDataSet(dataSetId, { status: app.STATION_ENABLED });
        break;
      case DATASET_DELETE_SELECTED_VALUES:
        Modal.confirm({
          title: 'Delete selected values',
          content: 'Are you sure want delete selected values in this data set?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.dataSetActions.deleteSelectedDataSetValues('id');
          },
        });
        break;
      case DATASET_DELETE_ALL_VALUES:
        Modal.confirm({
          title: 'Delete all values',
          content: 'Are you sure want delete all values in this data set?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.dataSetActions.deleteDataSetValue({ dataSetId });
          },
        });
        break;
      case DATASET_DELETE:
        Modal.confirm({
          title: 'Delete data set',
          content: 'Are you sure want delete this data set?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.dataSetActions.deleteDataSet({ id: dataSetId });
          },
        });
        break;
      default:
        break;
    }
  };

  render() {
    const { dataSets, dataSetId } = this.props;
    const dataSet = dataSets[dataSetId];

    const dataSetSorted = dataSets ? Object.values(dataSets).filter((dataSet) => dataSet !== undefined).sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    }) : [];

    const menuActions = (
      <Menu onClick={this.handlerActionSelect} selectable={false}>
        {dataSet.status == app.STATION_ENABLED ?
          <Menu.Item key={DATASET_DISABLE}><Icon type="close-square-o" /> Disable</Menu.Item>
          :
          <Menu.Item key={DATASET_ENABLE}><Icon type="check-square-o" /> Enable</Menu.Item>
        }
        <Menu.Item key={DATASET_DELETE_SELECTED_VALUES}><Icon type="bars" /> Delete selected values</Menu.Item>
        <Menu.Item key={DATASET_DELETE_ALL_VALUES}><Icon type="table" /> Delete all values</Menu.Item>
        <Menu.Item key={DATASET_DELETE}><Icon type="delete" /> Delete data set</Menu.Item>
      </Menu>
    );

    return (
      <div className="dataset-actions">
        <Col span={8}>
          <Link to="/dataset"><Button icon="arrow-left">Data series</Button></Link>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Select
            value={dataSetId}
            style={{ width: 150 }}
            placeholder="Select data series"
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handlerStationChange}
          >
            {dataSetSorted.map((dataSet, i) => <Select.Option key={dataSet.id.toString()}>{dataSet.name}</Select.Option>)}
          </Select>
          {' '}
          <Dropdown overlay={menuActions} placement="bottomCenter" trigger={['click']}>
            <Button>Actions <Icon type="down" /></Button>
          </Dropdown>
        </Col>
        <Col span={8} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    dataSets: state.dataSet.dataSets,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dataSetActions: bindActionCreators(dataSetActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DataSetValueActions));
