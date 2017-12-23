// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {remote} from 'electron';
import {Menu, Dropdown, Button, Icon, Modal} from 'antd';
import {ImportProgress} from '../widgets/ImportProgress';
import * as dataSetActions from '../../actions/dataSet';
import * as dataSetImportActions from '../../actions/dataSetImport';
import * as app from '../../constants/app';

const {dialog, BrowserWindow} = remote;
const mainWindow = BrowserWindow.getAllWindows()[0];
const currentWindow = remote.getCurrentWindow();

const DATASET_DELETE_ALL = 'DATASET_DELETE_ALL';
const DATASET_DELETE_SELECTED = 'DATASET_DELETE_SELECTED';
const DATASET_VALUES_DELETE_SELECTED = 'DATASET_VALUES_DELETE_SELECTED';

class DataSetImport extends Component {
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

  handlerActionSelect = (e) => {
    switch (e.key) {
      case DATASET_VALUES_DELETE_SELECTED:
        Modal.confirm({
          title: 'Delete data for selected data sets',
          content: 'Are you sure want delete data for selected data sets?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.dataSetActions.deleteSelectedDataSetValues('dataSetId');
          },
        });
        break;
      case DATASET_DELETE_SELECTED:
        Modal.confirm({
          title: 'Delete selected data sets',
          content: 'Are you sure want delete selected data sets?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.dataSetActions.deleteSelectedDataSets();
          },
        });
        break;
      case DATASET_DELETE_ALL:
        Modal.confirm({
          title: 'Delete all data sets',
          content: 'Are you sure want delete all data sets?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.dataSetActions.clearDataSets();
          },
        });
        break;
      default:
        break;
    }
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

    const menuActions = (
      <Menu onClick={this.handlerActionSelect} selectable={false}>
        <Menu.Item key={DATASET_VALUES_DELETE_SELECTED} disable><Icon type="table" /> Delete data for selected</Menu.Item>
        <Menu.Item key={DATASET_DELETE_SELECTED}><Icon type="bars" /> Delete selected</Menu.Item>
        <Menu.Item key={DATASET_DELETE_ALL}><Icon type="delete" /> Delete all</Menu.Item>
      </Menu>
    );

    return (
      <div className="dataset-import">
        <Button onClick={this.props.dataSetActions.getData}>
          <Icon type="reload" /> Update chart
        </Button>{" "}
        <Dropdown overlay={menuFileType} placement="bottomCenter" trigger={['click']}>
          <Button>{titleImport} <Icon type="down" /></Button>
        </Dropdown>{" "}
        <Dropdown overlay={menuActions} placement="bottomCenter" trigger={['click']}>
          <Button>Actions <Icon type="down"/></Button>
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
    dataSetImportActions: bindActionCreators(dataSetImportActions, dispatch),
    dataSetActions: bindActionCreators(dataSetActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetImport);
