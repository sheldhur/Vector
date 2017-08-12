// @flow
import {remote} from 'electron';
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Card, Col, Row, Button, DatePicker, Input, InputNumber, Select, Radio} from 'antd';
import moment from 'moment';
import * as MainActions from './../actions/main';
import * as app from './../constants/app';
// import './../lib/geomagneticData/_test';


class Home extends Component {
  avgByList = app.IMPORT_AVG;
  avgData = app.IMPORT_AVG_DATA.map((item, i) => {
    return {label: item, value: i};
  });

  state = {
    avg: {
      by: this.avgByList[1],
      value: 1,
    },
    period: {
      start: moment(),
      end: moment(),
    }
  };

  handlerDaterangeOk = (value) => {
    this.setState({
      period: {
        start: value[0],
        end: value[1],
      }
    });
  };

  handlerAvgBySelect = (value) => {
    this.setState({
      avg: value
    });
  };

  handlerAvgValueChange = (e) => {
    let {avg} = this.state;
    avg.value = parseInt(e.target.value);
    this.setState({
      avg: avg
    });
  };

  handlerDialog = (e, isCreateNew) => {
    const settings = isCreateNew ? {
      time: {
        avg: this.state.avg,
        period: this.state.period,
        selected: {
          start: null,
          end: null,
        },
      }
    } : undefined;
    this.props.mainActions.dialogOpenCreateDataBase(settings)
  };

  disabledRangeTime = () => {
    return {
      disabledSeconds: () => {
        let range = [...Array(60).keys()];
        range.shift();

        return range;
      },
    };
  };

  render = () => {
    const {avg, period} = this.state;

    const isDateRange = !(period.start !== null || period.end !== null)

    return (
      <div className="home-page">
        <Row justify="center" align="middle">
          <Col span={12} offset={6}>
            <Card title={`${remote.app.getName()} v${remote.app.getVersion()}`} bordered={false}>
              <Row>
                <Button
                  icon="file"
                  type="primary"
                  onClick={(e) => this.handlerDialog(e, false)}
                >Open database</Button>
              </Row>
              <hr/>
              <Row>
                <Input.Group compact>
                  <Input style={{width: '100px'}} value="Time period" disabled className="ant-input-group-addon"/>
                  <DatePicker.RangePicker
                    showTime={{
                      hideDisabledOptions: true,
                      defaultValue: moment('00:00:00', 'HH:mm:ss')
                    }}
                    format={app.FORMAT_DATE_INPUT}
                    defaultValue={[period.start, period.end]}
                    placeholder={['Start Time', 'End Time']}
                    disabledTime={this.disabledRangeTime}
                    onOk={this.handlerDaterangeOk}
                  />
                </Input.Group>
              </Row>
              <Row>
                <Input.Group compact>
                  <Input style={{width: '100px'}} value="Averaged data" disabled className="ant-input-group-addon"/>
                  <InputNumber min={1} defaultValue={avg.value} onChange={this.handlerAvgValueChange}/>
                  <Select defaultValue={avg.by} onChange={this.handlerAvgBySelect}>
                    {this.avgByList.map((item, i) => {
                      return <Select.Option key={i} value={i.toString()}>{item}</Select.Option>;
                    })}
                  </Select>
                </Input.Group>
              </Row>
              <Row style={{display: 'none'}}>
                <Radio.Group options={this.avgData} defaultValue={0}/>
              </Row>
              <Row>
                <Button
                  icon="file-add"
                  type="primary"
                  onClick={(e) => this.handlerDialog(e, true)}
                  disabled={isDateRange}
                >Create new database</Button>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    // dbPath: state.main.dbPath,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
