// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { Col, Button, Select, Menu, Dropdown, Icon, Modal } from 'antd';
import * as stationActions from '../../actions/station';
import * as app from '../../constants/app';


const STATION_DISABLE = 'STATION_DISABLE';
const STATION_ENABLE = 'STATION_ENABLE';
const STATION_DELETE = 'STATION_DELETE';
const STATION_DELETE_VALUES = 'STATION_DELETE_VALUES';
const STATION_DELETE_ALL_VALUES = 'STATION_DELETE_ALL_VALUES';

class StationValueActions extends Component {
  handlerStationChange = (stationId) => {
    this.props.history.push(`/station/${stationId}`);
  };

  handlerActionSelect = (e) => {
    const { stationId } = this.props;

    switch (e.key) {
      case STATION_DISABLE:
        this.props.stationActions.updateStation(stationId, { status: app.STATION_DISABLED });
        break;
      case STATION_ENABLE:
        this.props.stationActions.updateStation(stationId, { status: app.STATION_ENABLED });
        break;
      case STATION_DELETE_VALUES:
        Modal.confirm({
          title: 'Delete selected values',
          content: 'Are you sure want delete selected values for this station?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.stationActions.deleteSelectedStationsValues('id');
          },
        });
        break;
      case STATION_DELETE_ALL_VALUES:
        Modal.confirm({
          title: 'Delete all values',
          content: 'Are you sure want delete all values for this station?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.stationActions.deleteStationValue({ stationId });
          },
        });
        break;
      case STATION_DELETE:
        Modal.confirm({
          title: 'Delete station',
          content: 'Are you sure want delete this station?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.stationActions.deleteStation({ id: stationId });
          },
        });
        break;
      default:
        break;
    }
  };

  render = () => {
    const { stations, stationId } = this.props;
    const station = stations[stationId];

    const stationsSorted = stations ? Object.values(stations).filter((station) => station !== undefined).sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    }) : [];

    const menuActions = (
      <Menu onClick={this.handlerActionSelect} selectable={false}>
        {station.status == app.STATION_ENABLED ?
          <Menu.Item key={STATION_DISABLE}><Icon type="close-square-o" /> Disable</Menu.Item>
          :
          <Menu.Item key={STATION_ENABLE}><Icon type="check-square-o" /> Enable</Menu.Item>
        }
        <Menu.Item key={STATION_DELETE_VALUES}><Icon type="bars" /> Delete selected values</Menu.Item>
        <Menu.Item key={STATION_DELETE_ALL_VALUES}><Icon type="table" /> Delete all values</Menu.Item>
        <Menu.Item key={STATION_DELETE}><Icon type="delete" /> Delete station</Menu.Item>
      </Menu>
    );

    return (
      <div className="station-actions">
        <Col span={8}>
          <Link to="/station"><Button icon="arrow-left">Stations</Button></Link>
        </Col>
        <Col span={8} style={{ textAlign: 'center' }}>
          <Select
            value={stationId}
            style={{ width: 150 }}
            placeholder="Select station"
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handlerStationChange}
          >
            {stationsSorted.map((station, i) => <Select.Option key={station.id.toString()}>{station.name}</Select.Option>)}
          </Select>
          {' '}
          <Dropdown overlay={menuActions} placement="bottomCenter" trigger={['click']}>
            <Button>Actions <Icon type="down" /></Button>
          </Dropdown>
        </Col>
        <Col span={8} />
      </div>
    );
  };
}

function mapStateToProps(state) {
  return {
    stations: state.station.stations,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationActions: bindActionCreators(stationActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StationValueActions));
