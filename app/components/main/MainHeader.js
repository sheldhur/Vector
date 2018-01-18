import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import moment from 'moment';
import MainHeaderControls from './MainHeaderControls';
import MainHeaderCapture from './MainHeaderCapture';
import MainUpdateApp from './MainUpdateApp';
import Settings from '../settings/Settings';
import SettingsDataTimeRage from '../settings/SettingsDataTimeRage';
import * as mainActions from '../../actions/main';
import * as dataSetActions from '../../actions/dataSet';
import * as stationActions from '../../actions/station';
import * as uiActions from '../../actions/ui';
import { IS_PROD } from '../../constants/app';


class MainHeader extends Component {
  size = 'small';

  componentWillMount = () => {
    setTimeout(this.handlerReload, 100);

    this.props.uiActions.setChartCurrentTime(null);
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.dbPath !== this.props.dbPath) {
      this.handlerReload();
    }
  };

  handlerReload = (e) => {
    if (!this.props.isLoading) {
      this.props.stationActions.getLatitudeAvgValues();
      this.props.dataSetActions.getData();
    }
  };

  handlerClose = (e) => {
    this.props.mainActions.closeDataBase();
  };

  handlerDatePickerOk = (value) => {
    this.props.mainActions.saveSettings({ projectTimeSelected: value })
      .then(this.handlerReload)
      .catch((e) => {
        console.error(e);
      });
  };

  render = () => {
    const {
      timeSelected, timePeriod, timeAvg, isLoading
    } = this.props;

    return (
      <div className="main-page-header">
        <Input.Group size={this.size} className="custom-group" compact>
          <span className="ant-input-group-addon">Time</span>
          <SettingsDataTimeRage
            defaultValue={timeSelected.map((item) => moment(item))}
            valueLimit={timePeriod.map((item) => moment(item))}
            onOk={(value) => this.handlerDatePickerOk(value)}
          />
          <span className="ant-input-group-addon">{timeAvg.value} {timeAvg.by.substr(0, 3)}. data</span>
          <Button
            size={this.size}
            icon="reload"
            type="danger"
            className="spin"
            loading={isLoading}
            onClick={(e) => this.handlerReload(e)}
          />
          {!IS_PROD && <Button
            size={this.size}
            icon="close-circle-o"
            type="danger"
            onClick={(e) => this.handlerClose(e)}
          />}
        </Input.Group>
        <Settings size={this.size} />
        <MainHeaderControls size={this.size} onTick={this.props.stationActions.getStationsValue} />
        <MainHeaderCapture size={this.size} />
        <MainUpdateApp />
      </div>
    );
  };
}

function mapStateToProps(state) {
  return {
    timeAvg: state.main.settings.projectTimeAvg,
    timePeriod: state.main.settings.projectTimePeriod,
    timeSelected: state.main.settings.projectTimeSelected,
    isLoading: state.station.isLoading || state.dataSet.isLoading || state.main.isLoading,
    dbPath: state.main.dbPath,
    isError: state.main.isError,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(mainActions, dispatch),
    dataSetActions: bindActionCreators(dataSetActions, dispatch),
    stationActions: bindActionCreators(stationActions, dispatch),
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
