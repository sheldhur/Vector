// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {remote} from 'electron';
import {Menu, Dropdown, Button, Icon, Modal, Progress, Tooltip} from 'antd';
import {ImportProgress} from '../widgets/ImportProgress';
import * as DataSetActions from './../../actions/dataSet';
import * as DataSetImportActions from './../../actions/dataSetImport';
import * as app from './../../constants/app';

const {dialog, BrowserWindow} = remote;
const mainWindow = BrowserWindow.getAllWindows()[0];
const currentWindow = remote.getCurrentWindow();


class DataSetOptions extends Component {
  fileTypes = app.IMPORT_TYPE_DATA_SET;

  handlerDropdownSelect = (e) => {
    const fileType = this.fileTypes[e.key];

    dialog.showOpenDialog(currentWindow, {
      title: 'Select ' + fileType + ' format data file',
      defaultPath: 'project.db3',
      properties: ['openFile', 'multiSelections'],
      buttonLabel: 'Import ' + fileType + ' data',
    }, (filePaths) => {
      if (filePaths && filePaths.length) {
        this.props.dataSetImportActions.openModal();
        this.props.dataSetImportActions.importDataSet(filePaths, fileType);
      }
    });
  };

  handlerCancelClick = (e) => {
    this.props.dataSetImportActions.closeModal();
    this.props.dataSetActions.getData();
  };

  setSystemProgressBar = (value) => {
    if (value > 0) {
      mainWindow.setProgressBar(value / 100);
    } else {
      mainWindow.setProgressBar(-1);
    }
  };

  render() {
    const {progressBar, showModal, currentFile, importLog} = this.props.dataSetImport;

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
      <div className="dataset-import">
        <Button onClick={() => {this.props.dataSetActions.getData()}}><Icon type="reload" /> Update chart</Button>{" "}
        <Dropdown overlay={menuFileType} placement="bottomLeft" trigger={['click']}>
          <Button>{titleImport} <Icon type="down" /></Button>
        </Dropdown>
        <Modal
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
    dataSetImport: state.dataSetImport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dataSetImportActions: bindActionCreators(DataSetImportActions, dispatch),
    dataSetActions: bindActionCreators(DataSetActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetOptions);
