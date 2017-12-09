// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link, hashHistory} from 'react-router';
import {Col, Button, Select, Menu, Dropdown, Icon} from 'antd';
import * as DataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';


const DATASET_DISABLE = 'DATASET_DISABLE';
const DATASET_ENABLE = 'DATASET_ENABLE';
const DATASET_DELETE = 'DATASET_DELETE';
const DATASET_VALUES_DELETE = 'DATASET_VALUES_DELETE';

class DataSetValueActions extends Component {

  handlerStationChange = (dataSetId) => {
    hashHistory.replace(`/dataSet/${dataSetId}`);
  };

  handlerActionSelect = (e) => {
    const {stationId} = this.props;
    switch (e.key) {
      case DATASET_DISABLE:
        this.props.dataSetActions.updateStation(stationId, {status: app.STATION_DISABLED});
        break;
      case DATASET_ENABLE:
        this.props.dataSetActions.updateStation(stationId, {status: app.STATION_ENABLED});
        break;
      case DATASET_DELETE:
        this.props.dataSetActions.deleteStation({id: stationId});
        break;
      case DATASET_VALUES_DELETE:
        break;
      default:
        break;
    }
  };

  render() {
    const {dataSets, dataSetId} = this.props;
    const dataSet = dataSets[dataSetId];

    const dataSetSorted = dataSets ? Object.values(dataSets).filter((dataSet) => dataSet !== undefined).sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    }) : [];

    const menuActions = (
      <Menu onClick={this.handlerActionSelect} selectable={false}>
        {dataSet.status === app.STATION_ENABLED ?
          <Menu.Item key={DATASET_DISABLE}>Disable data series</Menu.Item>
          :
          <Menu.Item key={DATASET_ENABLE}>Enable data series</Menu.Item>
        }
        <Menu.SubMenu title={'Delete'}>
          <Menu.Item key={DATASET_DELETE}>Data series</Menu.Item>
          <Menu.Item key={DATASET_VALUES_DELETE} disabled>Values</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );

    return (
      <div className="dataset-actions">
        <Col span={8}>
          <Link to="/dataset"><Button icon="arrow-left">Data series</Button></Link>
        </Col>
        <Col span={8} style={{textAlign: 'center'}}>
          <Select
            value={dataSetId}
            style={{ width: 150 }}
            placeholder="Select data series"
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handlerStationChange}
          >
            {dataSetSorted.map((dataSet, i) => {
              return <Select.Option key={dataSet.id.toString()}>{dataSet.name}</Select.Option>;
            })}
          </Select>
          {" "}
          <Dropdown overlay={menuActions} placement="bottomLeft" trigger={['click']}>
            <Button>Actions <Icon type="down"/></Button>
          </Dropdown>
        </Col>
        <Col span={8}></Col>
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
    dataSetActions: bindActionCreators(DataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetValueActions);
