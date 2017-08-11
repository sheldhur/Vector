// @flow
import {remote, desktopCapturer, ipcRenderer} from 'electron';
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Button, Input, Modal, Icon} from 'antd';
import moment from 'moment';
import domToImage from 'dom-to-image';
import * as fs from 'fs';

const {dialog, BrowserWindow} = remote;


class MainHeaderCapture extends Component {
  size = 'small';

  handlerSaveImage = (e) => {
    dialog.showSaveDialog({
      title: 'Select path for image',
      defaultPath: this.props.currentTime ? `mainView ${moment(this.props.currentTime).format('YYYY-MM-DD HH-mm-ss')}.png` : 'mainView.png',
      properties: ['openFile', 'createDirectory'],
      buttonLabel: 'Save image',
      filters: [
        {name: 'PNG', extensions: ['png']},
      ],
    }, (filePath) => {
      if (filePath && filePath.length) {
        const chart = document.querySelector('#mainView');
        chart.classList.add('screencapture');
        domToImage.toPng(chart).then((dataUrl) => {
          chart.classList.remove('screencapture');
          fs.writeFile(filePath, dataUrl.replace(/^data:image\/png;base64,/, ""), 'base64', (error) => {
            if (error) {
              throw error;
            }

            console.log(filePath + ' has been saved');
          });
        });
      }
    });
  };

  render = () => {
    return (
      <Input.Group size={this.props.size} compact>
        <Button
          icon="picture"
          size={this.props.size}
          onClick={(e) => this.handlerSaveImage()}
        />

      </Input.Group>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentTime: state.chart.chartCurrentTime,
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(MainHeaderCapture);
