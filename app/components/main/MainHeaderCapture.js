// @flow
import { remote } from 'electron';
import { message, Button, Input, Modal, Icon } from 'antd';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import domToImage from 'dom-to-image';
import * as fs from 'fs';

const { dialog, BrowserWindow } = remote;
const currentWindow = remote.getCurrentWindow();


class MainHeaderCapture extends Component {
  size = 'small';

  handlerSaveImage = (e) => {
    dialog.showSaveDialog(currentWindow, {
      title: 'Select path for image',
      defaultPath: this.props.currentTime ? `mainView ${moment(this.props.currentTime).format('YYYY-MM-DD HH-mm-ss')}.png` : 'mainView.png',
      properties: ['openFile', 'createDirectory'],
      buttonLabel: 'Save image',
      filters: [
        { name: 'PNG', extensions: ['png'] },
      ],
    }, (filePath) => {
      if (filePath && filePath.length) {
        const chart = document.querySelector('#mainView');
        chart.classList.add('screencapture');
        domToImage.toPng(chart).then((dataUrl) => {
          chart.classList.remove('screencapture');
          fs.writeFile(filePath, dataUrl.replace(/^data:image\/png;base64,/, ""), 'base64', (error) => {
            if (error) {
              message.error(error.message, 6);
              throw error;
            } else {
              message.success(filePath + ' was saved', 3);
            }
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
    currentTime: state.ui.chartCurrentTime ? new Date(state.ui.chartCurrentTime) : null,
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(MainHeaderCapture);
