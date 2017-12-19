// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link, hashHistory} from 'react-router';
import {Col, Button, Select, Menu, Dropdown, Icon} from 'antd';
import * as stationActions from '../../actions/station';
import * as app from '../../constants/app';


const STATION_DISABLE = 'STATION_DISABLE';
const STATION_ENABLE = 'STATION_ENABLE';
const STATION_DELETE = 'STATION_DELETE';
const STATION_DELETE_VALUES = 'STATION_DELETE_VALUES';
const STATION_DELETE_ALL_VALUES = 'STATION_DELETE_ALL_VALUES';

class StationValueActions extends Component {

  componentWillMount = () => {
    const {stationId} = this.props;
    this.props.stationActions.getStationViewValues({stationId});
  };

  componentWillReceiveProps = (nextProps) => {
    const {stationId} = nextProps;
    this.props.stationActions.getStationViewValues({stationId});
  };

  handlerStationChange = (stationId) => {
    this.props.stationActions.getStationViewValues({stationId});
    hashHistory.replace(`/station/${stationId}`);
  };

  handlerActionSelect = (e) => {
    const {stationId} = this.props;
    switch (e.key) {
      case STATION_DISABLE:
        this.props.stationActions.updateStation(stationId, {status: app.STATION_DISABLED});
        break;
      case STATION_ENABLE:
        this.props.stationActions.updateStation(stationId, {status: app.STATION_ENABLED});
        break;
      case STATION_DELETE:
        this.props.stationActions.deleteStation({id: stationId});
        break;
      case STATION_DELETE_VALUES:
        this.props.stationActions.deleteSelectedStationsValues('id');
        break;
      case STATION_DELETE_ALL_VALUES:
        this.props.stationActions.deleteStationValue({stationId});
        break;
      default:
        break;
    }
  };

  render() {
    const {stations, stationId} = this.props;
    const station = stations[stationId];

    const stationsSorted = stations ? Object.values(stations).filter((station) => station !== undefined).sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    }) : [];

    const menuActions = (
      <Menu onClick={this.handlerActionSelect} selectable={false}>
        {station.status === app.STATION_ENABLED ?
          <Menu.Item key={STATION_DISABLE}>Disable station</Menu.Item>
          :
          <Menu.Item key={STATION_ENABLE}>Enable Station</Menu.Item>
        }
        <Menu.SubMenu title={'Delete'}>
          <Menu.Item key={STATION_DELETE}>Station</Menu.Item>
          <Menu.Item key={STATION_DELETE_VALUES}>Values</Menu.Item>
          <Menu.Item key={STATION_DELETE_ALL_VALUES}>All values</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );

    return (
      <div className="station-actions">
        <Col span={8}>
          <Link to="/station"><Button icon="arrow-left">Stations</Button></Link>
        </Col>
        <Col span={8} style={{textAlign: 'center'}}>
          <Select
            value={stationId}
            style={{ width: 150 }}
            placeholder="Select station"
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handlerStationChange}
          >
            {stationsSorted.map((station, i) => {
              return <Select.Option key={station.id.toString()}>{station.name}</Select.Option>;
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
    stations: state.station.stations,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationActions: bindActionCreators(stationActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationValueActions);
