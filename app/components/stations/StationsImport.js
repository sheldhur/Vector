// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {remote} from 'electron';
import {Menu, Dropdown, Button, Icon, Modal} from 'antd';
import {ImportProgress} from '../widgets/ImportProgress';
import * as StationActions from '../../actions/station';
import * as StationImportActions from '../../actions/stationImport';
import * as app from '../../constants/app';

const {dialog, BrowserWindow} = remote;
const mainWindow = BrowserWindow.getAllWindows()[0];
const currentWindow = remote.getCurrentWindow();


class StationImport extends Component {
  fileTypes = app.IMPORT_TYPE_STATION;

  handlerDropdownSelect = (e) => {
    const fileType = this.fileTypes[e.key];

    dialog.showOpenDialog(currentWindow, {
      title: 'Select ' + fileType + ' format data file',
      defaultPath: 'project.db3',
      properties: ['openFile', 'multiSelections'],
      buttonLabel: 'Import ' + fileType + ' data',
    }, (filePaths) => {
      if (filePaths && filePaths.length) {
        this.props.stationImportActions.openModal();
        this.props.stationImportActions.importStations(filePaths, fileType);
      }
    });
  };

  handlerCancelClick = (e) => {
    this.props.stationImportActions.closeModal();
  };

  setSystemProgressBar = (value) => {
    if (value > 0) {
      mainWindow.setProgressBar(value / 100);
    } else {
      mainWindow.setProgressBar(-1);
    }
  };

  render() {
    const {progressBar, showModal, currentFile, importLog} = this.props.stationImport;

    this.setSystemProgressBar(progressBar.total);

    const menuFileType = (
      <Menu onClick={this.handlerDropdownSelect} selectable={false}>
        {this.fileTypes.map((item, i) => {
          return <Menu.Item key={i}>{item}</Menu.Item>;
        })}
      </Menu>
    );

    const titleImport = (
      <span><Icon type="file-add"/> Import data</span>
    );

    return (
      <div className="station-import">
        <Button onClick={this.props.stationActions.getLatitudeAvgValues}><Icon type="reload"/> Update stations</Button>
        {" "}
        <Dropdown overlay={menuFileType} placement="bottomLeft" trigger={['click']}>
          <Button>{titleImport} <Icon type="down"/></Button>
        </Dropdown>
        <Modal
          wrapClassName="station-import"
          title={titleImport}
          visible={showModal}
          onCancel={this.handlerCancelClick}
          maskClosable={false}
          footer={[
            <Button key="cancel" size="large" onClick={this.handlerCancelClick}>Cancel</Button>
          ]}
        >
          <ImportProgress
            progressBar={progressBar}
            currentFile={currentFile}
            importLog={importLog}
          />
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    stationImport: state.stationImport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationImportActions: bindActionCreators(StationImportActions, dispatch),
    stationActions: bindActionCreators(StationActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationImport);
