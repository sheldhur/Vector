// @flow
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { remote } from 'electron';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as stationActions from '../../actions/station';
import * as uiActions from '../../actions/ui';
import * as app from '../../constants/app';
import { ImportProgress } from '../widgets/ImportProgress';

const { dialog, BrowserWindow } = remote;
const mainWindow = BrowserWindow.getAllWindows()[0];
const currentWindow = remote.getCurrentWindow();

const STATIONS_DELETE_ALL = 'STATIONS_DELETE_ALL';
const STATIONS_DELETE_SELECTED = 'STATIONS_DELETE_SELECTED';
const STATIONS_VALUES_DELETE_SELECTED = 'STATIONS_VALUES_DELETE_SELECTED';

class StationsActions extends Component {
  fileTypes = app.IMPORT_TYPE_STATION;

  handlerDropdownSelect = (e) => {
    const fileType = this.fileTypes[e.key];

    dialog.showOpenDialog(currentWindow, {
      title: `Select ${fileType} format data file`,
      defaultPath: 'project.db3',
      properties: ['openFile', 'multiSelections'],
      buttonLabel: `Import ${fileType} data`,
    }, (filePaths) => {
      if (filePaths && filePaths.length) {
        this.props.uiActions.importStations(filePaths, fileType);
      }
    });
  };

  handlerCancelClick = (e) => {
    if (this.props.progress.current < 100 || this.props.progress.total < 100) {
      Modal.confirm({
        title: 'Abort import stations',
        content: 'Are you sure want abort import stations?',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          this.props.uiActions.importCloseModal();
        },
      });
    } else {
      this.props.uiActions.importCloseModal();
    }
  };

  handlerActionSelect = (e) => {
    switch (e.key) {
      case STATIONS_VALUES_DELETE_SELECTED:
        Modal.confirm({
          title: 'Delete data for selected stations',
          content: 'Are you sure want delete data for selected stations?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.stationActions.deleteSelectedStationsValues('stationId');
          },
        });
        break;
      case STATIONS_DELETE_SELECTED:
        Modal.confirm({
          title: 'Delete selected stations',
          content: 'Are you sure want delete selected stations?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.stationActions.deleteSelectedStations();
          },
        });
        break;
      case STATIONS_DELETE_ALL:
        Modal.confirm({
          title: 'Delete all stations',
          content: 'Are you sure want delete all stations?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk: () => {
            this.props.stationActions.clearStations();
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
    const {
      progress, showModal, currentFile, log
    } = this.props;

    this.setSystemProgressBar(progress.total);

    const menuFileType = (
      <Menu onClick={this.handlerDropdownSelect} selectable={false}>
        {this.fileTypes.map((item, i) => <Menu.Item key={i}>{item}</Menu.Item>)}
      </Menu>
    );

    const titleImport = (
      <span><Icon type="file-add" /> Import data</span>
    );

    const menuActions = (
      <Menu onClick={this.handlerActionSelect} selectable={false}>
        <Menu.Item key={STATIONS_VALUES_DELETE_SELECTED} disable><Icon type="table" /> Clear data for
          selected
        </Menu.Item>
        <Menu.Item key={STATIONS_DELETE_SELECTED}><Icon type="bars" /> Delete selected</Menu.Item>
        <Menu.Item key={STATIONS_DELETE_ALL}><Icon type="delete" /> Delete all</Menu.Item>
      </Menu>
    );

    return (
      <div className="station-import">
        <Button onClick={this.props.stationActions.getLatitudeAvgValues}>
          <Icon type="reload" /> Update stations
        </Button>
        {' '}
        <Dropdown overlay={menuFileType} placement="bottomCenter" trigger={['click']}>
          <Button>{titleImport} <Icon type="down" /></Button>
        </Dropdown>
        {' '}
        <Dropdown overlay={menuActions} placement="bottomCenter" trigger={['click']}>
          <Button>Actions <Icon type="down" /></Button>
        </Dropdown>
        <Modal
          wrapClassName="station-import"
          title={titleImport}
          visible={showModal}
          onCancel={this.handlerCancelClick}
          footer={[
            <Button key="cancel" size="large" onClick={this.handlerCancelClick}>Cancel</Button>
          ]}
        >
          <ImportProgress
            progress={progress}
            currentFile={currentFile}
            log={log}
          />
        </Modal>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    showModal: state.ui.importShowModal,
    currentFile: state.ui.importCurrentFile,
    progress: state.ui.importProgress,
    log: state.ui.importLog,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
    stationActions: bindActionCreators(stationActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationsActions);
