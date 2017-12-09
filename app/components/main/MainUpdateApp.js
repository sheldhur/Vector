import {ipcRenderer} from 'electron';
import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {Modal, Icon, Row, Col} from "antd";
import * as MainActions from "./../../actions/main";


class MainUpdateApp extends Component {
  handlerOk = () => {
    ipcRenderer.send('installUpdate');
    this.handlerCancel();
  };

  handlerCancel = () => {
    this.props.mainActions.setUpdate(null);
  };

  render() {
    const {update} = this.props;

    if (update) {
      return (
        <Modal
          title={<span>Update ready for install</span>}
          visible={true}
          onOk={() => this.handlerOk()}
          onCancel={() => this.handlerCancel()}
          okText={<span><Icon type="download"/> Install update</span>}
          wrapClassName="main-update-app"
          zIndex={999}
          width={700}
        >
          <Row gutter={50}>
            <Col span={2}>
              <Icon type="info-circle" style={{fontSize: '300%', color: '#108ee9', padding: '12px 0'}}/>
            </Col>
            <Col span={10}>
              <h1>{update.releaseName}</h1>
              <i>{new Date(update.releaseDate).toLocaleString()}</i>
            </Col>
          </Row>
          <Row style={{fontSize: '125%'}}>
            <div dangerouslySetInnerHTML={{__html: update.releaseNotes}}/>
          </Row>
        </Modal>
      );
    }

    return null;
  }
}

MainUpdateApp.propTypes = {};
MainUpdateApp.defaultProps = {};

function mapStateToProps(state) {
  return {
    update: state.main.update
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainUpdateApp);
