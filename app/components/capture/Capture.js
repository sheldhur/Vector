// @flow
import {remote, ipcRenderer} from 'electron';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import * as fs from 'fs';
import MainDashboard from '../main/MainDashboard';
import * as uiActions from '../../actions/ui';
import * as stationActions from '../../actions/station';


const captureWin = remote.getCurrentWindow();
const mainWin = captureWin.parent;

//https://www.youtube.com/watch?v=_z-s_P6bDh4
class Capture extends Component {
  savePath = '';

  getChildContext = () => {
    return {
      test: 'test getChildContext',
      onCompomentWillMount: this.childCompomentWillMount,
      onComponentDidUpdate: this.childComponentDidUpdate
    }
  };

  childCompomentWillMount = () => {

  };

  childComponentDidUpdate = (component) => {
    console.log(component, 'componentDidUpdate');
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    return false;
  };

  componentWillMount = () => {
    ipcRenderer.on('init', (event, data) => {
      this.savePath = data.savePath;
      this.timeShift(moment(data.currentType).toDate());
    });
  };

  componentWillReceiveProps = (nextProps) => {
    console.log(this.props.currentTime, nextProps.currentTime);
    if (this.props.currentTime !== null && nextProps.currentTime !== this.props.currentTime) {
      const saveName = moment(this.props.currentTime).format('YYYY-MM-DD HH-mm-ss') + '.png';
      captureWin.capturePage((img) => {
        remote.require('fs').writeFile(this.savePath + '\\' + saveName, img.toPng(), (error) => {
          if (error) {
            console.log(error);
          }

          setTimeout(() => {
            this.timeShift(1);
          }, 150);
        });
      });
    }
  };

  timeShift = (value) => {
    if (value instanceof Date) {
      console.log('this.props.uiActions.setChartCurrentTime', value);
      this.props.uiActions.setChartCurrentTime(value);
    } else {
      this.props.uiActions.shiftChartCurrentTime(value);
    }
    return this.props.stationActions.getStationsValue();
  };

  render = () => {
    return (
      <div className={`main-page theme-light screencapture`}>
        <MainDashboard/>
      </div>
    );
  }
}

Capture.childContextTypes  = {
  test: PropTypes.string,
  onCompomentWillMount: PropTypes.any,
  onComponentDidUpdate: PropTypes.any
};

function mapStateToProps(state) {
  return {
    currentTime: state.ui.chartCurrentTime,
    // time: state.main.settings.project.time.selected,
    timeStart: state.main.settings.projectTimeSelected[0],
    timeEnd: state.main.settings.projectTimeSelected[1],
    stationsValue: state.station.stationsValue,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    stationActions: bindActionCreators(stationActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Capture);
