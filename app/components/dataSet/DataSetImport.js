// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {remote} from 'electron';
import {Menu, Dropdown, Button, Icon, Modal, Progress, Tooltip, message} from 'antd';
import * as MainActions from './../../actions/main';
import * as DataSetActions from './../../actions/dataSet';
import * as DataSetImportActions from './../../actions/dataSetImport';
import * as app from './../../constants/app';

const {dialog, BrowserWindow} = remote;
const mainWindow = BrowserWindow.getAllWindows()[0];
const currentWindow = remote.getCurrentWindow();


class DataSetOptions extends Component {
  fileTypes = app.IMPORT_TYPE_DATA_SET;

  componentWillMount() {

  }

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
    const {progressBar, showModal, currentFile} = this.props.dataSetImport;

    this.setSystemProgressBar(progressBar.total);

    const currentFileName = currentFile.replace(/^.*[\\\/]/, '');
    const currentFileWbr = <span dangerouslySetInnerHTML={{__html: currentFile.replace(/\\/g, (str) => {
      return str + '<wbr />';
    })}}/>;

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
          <div className="dataset-import">
            <Progress percent={Math.ceil(progressBar.total)} className="animation-off"/>
            <small>
              File:&nbsp;
              <Tooltip
                title={currentFileWbr}
                placement="right"
                overlayClassName="dataset-import file-path"
              >{currentFileName}</Tooltip>
            </small>
            <Progress percent={Math.ceil(progressBar.current)} className="animation-off"/>
          </div>
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    main: state.main,
    dataSetImport: state.dataSetImport
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dataSetImportActions: bindActionCreators(DataSetImportActions, dispatch),
    dataSetActions: bindActionCreators(DataSetActions, dispatch),
    mainActions: bindActionCreators(MainActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetOptions);
