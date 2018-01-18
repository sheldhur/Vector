import { remote } from 'electron';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Card, Col, Row, Button, Input, InputNumber, Select, Radio, Modal } from 'antd';
import moment from 'moment';
import { LoadingAlert } from './widgets/ChartAlert';
import SettingsDataTimeRage from './settings/SettingsDataTimeRage';
import MainUpdateApp from './main/MainUpdateApp';
import * as mainActions from '../actions/main';
import * as app from '../constants/app';

const settings = JSON.parse(window.localStorage[app.LS_KEY_APP_SETTINGS] || null);
const theme = settings ? settings.appTheme : 'night';


class Home extends Component {
  state = {
    avg: {
      by: app.IMPORT_AVG[1],
      value: 1,
    },
    period: [null, null]
  };

  handlerDaterangeOk = (period) => {
    this.setState({ period });
  };

  handlerAvgBySelect = (value) => {
    this.setState({
      avg: value
    });
  };

  handlerAvgValueChange = (value) => {
    const { avg } = this.state;
    avg.value = parseInt(value);
    this.setState({
      avg
    });
  };

  handlerDialog = (e, isCreateNew) => {
    const initSettings = isCreateNew ? {
      projectTimePeriod: this.state.period,
      projectTimeSelected: this.state.period,
      projectTimeAvg: this.state.avg,
    } : undefined;

    this.props.mainActions.dialogOpenCreateDataBase(initSettings);
  };

  render = () => {
    const { avg, period } = this.state;
    const avgData = app.IMPORT_AVG_DATA.map((item, i) => ({ label: item, value: i }));
    const isDateRange = period[0] && period[1];

    if (this.props.isLaunch || this.props.isLoading) {
      return (<LoadingAlert className={`theme-${theme}`} />);
    }

    if (this.props.isError) {
      Modal.error({
        title: 'Project file error',
        content: this.props.isError.message
      });
    }

    return (
      <div className="home-page">
        <Row justify="center" align="middle">
          <Col span={12} offset={6}>
            <Card title={remote.app.getName()} bordered={false}>
              <Row>
                <Button
                  icon="file"
                  type="primary"
                  onClick={(e) => this.handlerDialog(e, false)}
                >Open database
                </Button>
              </Row>
              <hr />
              <Row>
                <Input.Group compact>
                  <Input style={{ width: '100px' }} value="Time period" disabled className="ant-input-group-addon" />
                  <SettingsDataTimeRage
                    defaultValue={period.map(item => (item ? moment(item) : item))}
                    onOk={this.handlerDaterangeOk}
                  />
                </Input.Group>
              </Row>
              <Row>
                <Input.Group compact>
                  <Input style={{ width: '150px' }} value="Averaged data" disabled className="ant-input-group-addon" />
                  <InputNumber min={1} defaultValue={avg.value} onChange={this.handlerAvgValueChange} />
                  <Select defaultValue={avg.by} onChange={this.handlerAvgBySelect}>
                    {app.IMPORT_AVG.map((item, i) => (<Select.Option
                      key={item}
                      value={i.toString()}
                    >{item}</Select.Option>))}
                  </Select>
                </Input.Group>
              </Row>
              <Row style={{ display: 'none' }}>
                <Radio.Group options={avgData} defaultValue={0} />
              </Row>
              <Row>
                <Button
                  icon="file-add"
                  type="primary"
                  onClick={(e) => this.handlerDialog(e, true)}
                  disabled={!isDateRange}
                >Create new database</Button>
              </Row>
            </Card>
          </Col>
        </Row>
        <MainUpdateApp />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    dbPath: state.main.dbPath,
    isError: state.main.isError,
    isLaunch: state.main.isLaunch,
    isLoading: state.main.isLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(mainActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
