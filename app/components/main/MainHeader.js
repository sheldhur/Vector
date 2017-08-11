// @flow
import {remote} from 'electron';
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Button, Input} from 'antd';
import moment from 'moment';
import MainHeaderControls from './MainHeaderControls';
import MainHeaderCapture from './MainHeaderCapture';
import Settings from './../settings/Settings';
import SettingsDataTimeRage from './../settings/SettingsDataTimeRage';
import * as MainActions from './../../actions/main';
import * as DataSetActions from './../../actions/dataSet';
import * as StationActions from './../../actions/station';
import * as ChartActions from './../../actions/chart';
import {IS_PROD} from "../../constants/app";


class MainHeader extends Component {
  size = 'small';

  componentWillMount() {
    this.handlerReload();
    this.props.chartActions.setChartCurrentTime(null);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dbPath && !nextProps.isError) {
      this.handlerReload();
    }
  }

  handlerReload = (e) => {
    this.props.stationActions.getLatitudeAvgValues();
    this.props.dataSetActions.getData();
    // e.target.blur(); // TODO: focusout not working
  };

  handlerClose = (e) => {
    this.props.mainActions.closeDataBase();
    // e.target.blur(); // TODO: focusout not working
  };

  handlerDatePickerOk = (value) => {
    this.props.mainActions.saveSettings({
      time: {
        selected: {
          start: value[0],
          end: value[1],
        }
      }
    }).then(() => {
      this.handlerReload();
    });
  };

  render() {
    const {time} = this.props;

    return (
      <div className="main-page-header">
        <Input.Group size={this.size} className="custom-group" compact>
          <span className="ant-input-group-addon">Time</span>
          <SettingsDataTimeRage
            defaultValue={[moment(time.selected.start), moment(time.selected.end)]}
            valueLimit={[moment(time.period.start), moment(time.period.end)]}
            onOk={(value) => this.handlerDatePickerOk(value)}
          />
          <span className="ant-input-group-addon">avg. {time.avg.value} {time.avg.by}</span>
          <Button
            size={this.size}
            icon="reload"
            type="danger"
            className="spin"
            onClick={(e) => this.handlerReload(e)}
          />
          {!IS_PROD && <Button
            size={this.size}
            icon="close-circle-o"
            type="danger"
            onClick={(e) => this.handlerClose(e)}
          />}
        </Input.Group>
        <Settings size={this.size}/>
        <MainHeaderControls size={this.size}/>
        <MainHeaderCapture size={this.size}/>
      </div>
    );

  }
}

function mapStateToProps(state) {
  return {
    time: state.main.settings.project.time,
    dbPath: state.main.dbPath,
    isError: state.main.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch),
    dataSetActions: bindActionCreators(DataSetActions, dispatch),
    stationActions: bindActionCreators(StationActions, dispatch),
    chartActions: bindActionCreators(ChartActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainHeader);
