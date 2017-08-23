// @flow
import React, {Component, PropTypes} from "react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {Modal, Icon, Button, Input, InputNumber, Select, Radio, Form, Switch, Tabs, Col, Alert} from "antd";
import moment from "moment";
import SettingsAvgChartLines from "./SettingsAvgChartLines";
import SettingsAvgChartLatitudes from "./SettingsAvgChartLatitudes";
import SettingsDataTimeRage from "./SettingsDataTimeRage";
import * as MainActions from "./../../actions/main";
import * as app from "./../../constants/app";
import "./../../utils/helper";


class Settings extends Component {
  state = {
    modalVisible: false,
    modalHeight: 250,
  };

  calcModalHeight = () => {
    let modalHeight = (window.innerHeight / 100 * 50) - 50;
    if (modalHeight < 250) {
      modalHeight = 250;
    }

    this.setState({modalHeight});
  };

  componentWillMount = () => {
    this.calcModalHeight()
    window.addEventListener('resize', this.calcModalHeight);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.calcModalHeight);
  };

  createRange = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  //TODO: время для сегодняшнего дня
  disabledRangeTime = (current, type, range) => {
    let disabled = {
      disabledSeconds: () => {
        let seconds = [...Array(60).keys()];
        seconds.shift();

        return seconds;
      }
    };

    if (range && Array.isArray(current) && current[type === 'start' ? 0 : 1].format('YYYY-MM-DD') === range[type].format('YYYY-MM-DD')) {
      let rangeHour = range[type].hour();
      let rangeMinute = range[type].minute();
      disabled.disabledHours = () => {
        return type === 'start' ? this.createRange(0, rangeHour) : this.createRange(rangeHour + 1, 24);
      };
      disabled.disabledMinutes = (selectedHour) => {
        if (selectedHour === rangeHour) {
          return type === 'start' ? this.createRange(0, rangeMinute) : this.createRange(rangeMinute + 1, 60)
        }
      };
    }

    return disabled;
  };

  disabledRangeDate = (current, range) => {
    let currentDate = current.clone().startOf('date');
    let rangeDate = range ? {
      start: range.start.clone().startOf('date'),
      end: range.end.clone().startOf('date'),
    } : null;
    let nowDate = moment().startOf('date');

    return this.filterRangeDataTime(currentDate, rangeDate, nowDate);
  };

  filterRangeDataTime = (current, range, now) => {
    let result = true;
    if (current) {
      let currentMs = current.valueOf();
      if (range) {
        let rangeMs = [
          range.start.valueOf(),
          range.end.valueOf()
        ];
        result = !currentMs.between(rangeMs, true);
      } else {
        let nowMs = now.valueOf();
        result = current > nowMs;
      }
    }

    return result;
  };

  handlerModalOpen = () => {
    this.setState({modalVisible: true});
  };

  handlerModalClose = () => {
    this.setState({modalVisible: false});
  };

  handlerReset = (e) => {
    //TODO: SettingsAvgChartLines мутирует стейт
    this.props.mainActions.loadSettings().then(() => {
      this.handlerModalClose();
    });
  };

  handlerSave = (e) => {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();

    values.project.mapLayer.dH.scaleAuto = values.project.mapLayer.dH.scaleAuto === 'true';
    values.project.mapLayer.dZ.scaleAuto = values.project.mapLayer.dZ.scaleAuto === 'true';

    values.project.time.period = {
      start: values.project.time.period[0].millisecond(0).toISOString(),
      end: values.project.time.period[1].millisecond(0).toISOString(),
    };

    values.project.time.selected = {
      start: values.project.time.selected[0].millisecond(0).toISOString(),
      end: values.project.time.selected[1].millisecond(0).toISOString(),
    };

    this.props.mainActions.saveSettings(values).then(() => {
      this.handlerModalClose();
    });
  };

  handlerInputNumberFix = (e) => {
    if (e.keyCode.between([65, 90], true)) {
      e.preventDefault();
    }
  };

  handlerDatePickerOpenChange = (status) => {
    if (!status) {
      this.props.form.resetFields(['time.period', 'time.selected']);
    }
  };

  getValidationRules = () => {
    const {settings, maximum} = this.props;
    const {setFieldsValue} = this.props.form;

    return {
      'app.theme': {
        initialValue: settings.app.theme,
        rules: [{
          type: 'string'
        }],
      },
      'app.language': {
        initialValue: settings.app.language,
        rules: [{
          type: 'string'
        }],
      },
      'app.antiAliasing': {
        initialValue: settings.app.antiAliasing,
        valuePropName: 'checked'
      },
      'app.mapLayer.world.scale': {
        initialValue: settings.app.mapLayer.world.scale,
        rules: [{
          type: 'string'
        }],
      },
      'app.mapLayer.projectionType': {
        initialValue: settings.app.mapLayer.projectionType,
        rules: [{
          type: 'string'
        }],
      },
      'app.mapLayer.world.countries': {
        initialValue: settings.app.mapLayer.world.countries,
        valuePropName: 'checked'
      },
      'app.mapLayer.world.color.water': {
        initialValue: settings.app.mapLayer.world.color.water,
        rules: [{
          type: 'float', message: 'Is not a integer!'
        }],
      },
      'app.mapLayer.world.color.land': {
        initialValue: settings.app.mapLayer.world.color.land,
        rules: [{
          type: 'float', message: 'Is not a integer!'
        }],
      },
      'app.mapLayer.world.color.border': {
        initialValue: settings.app.mapLayer.world.color.border,
        rules: [{
          type: 'float', message: 'Is not a integer!'
        }],
      },
      'app.time.shiftStep': {
        initialValue: settings.app.time.shiftStep,
        rules: [{
          type: 'integer', message: 'Is not a integer!',
        }]
      },
      'app.time.playDelay': {
        initialValue: settings.app.time.playDelay,
        rules: [{
          type: 'integer', message: 'Is not a integer!',
        }]
      },
      'project.time.period': {
        initialValue: [settings.project.time.period.start, settings.project.time.period.end],
        rules: [{
          type: 'array',
          fields: {
            0: {type: "object", required: true},
            1: {type: "object", required: true},
          },
          message: 'Please select time!'
        }]
      },
      'project.time.selected': {
        initialValue: [settings.project.time.selected.start, settings.project.time.selected.end],
        rules: [{
          type: 'array',
          fields: {
            0: {type: "object", required: true},
            1: {type: "object", required: true},
          },
          message: 'Please select time!'
        },
          // {
          //   validator: (rule, value, callback) => {
          //     let {form} = this.props;
          //     let timePeriod = form.getFieldValue('time.period');
          //     if (value) {
          //
          //     }
          //     console.log({timePeriod, value});
          //     callback();
          //   }
          // }
        ],
      },
      'project.mapLayer.dH.enabled': {
        initialValue: settings.project.mapLayer.dH.enabled,
        valuePropName: 'checked'
      },
      'project.mapLayer.dZ.enabled': {
        initialValue: settings.project.mapLayer.dZ.enabled,
        valuePropName: 'checked'
      },
      'project.mapLayer.dH.scaleAuto': {
        initialValue: settings.project.mapLayer.dH.scaleAuto.toString(),
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'mapLayer.dH.scale': value !== 'true' ? settings.project.mapLayer.dH.scale : (maximum ? maximum.dH : NaN)
            })
          }
        }]
      },
      'project.mapLayer.dZ.scaleAuto': {
        initialValue: settings.project.mapLayer.dZ.scaleAuto.toString(),
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'mapLayer.dZ.scale': value !== 'true' ? settings.project.mapLayer.dZ.scale : (maximum ? maximum.dZ : NaN)
            })
          }
        }]
      },
      'project.mapLayer.dH.scale': {
        initialValue: !settings.project.mapLayer.dH.scaleAuto ? settings.project.mapLayer.dH.scale : (maximum ? maximum.dH : NaN),
        rules: [{
          type: 'number', message: 'Is not a integer!',
        }]
      },
      'project.mapLayer.dZ.scale': {
        initialValue: !settings.project.mapLayer.dZ.scaleAuto ? settings.project.mapLayer.dZ.scale : (maximum ? maximum.dZ : NaN),
        rules: [{
          type: 'number', message: 'Is not a integer!',
        }]
      },
      'project.mapLayer.dZ.view': {
        initialValue: settings.project.mapLayer.dZ.view,
      },
      'project.avgChart.lines': {
        initialValue: settings.project.avgChart.lines,
        rules: [{
          type: 'array',
          // fields: {
          //   0: {type: "object", required: true},
          //   1: {type: "object", required: true},
          // },
          message: 'Please add lines!'
        }]
      },
      'project.avgChart.latitudeRanges': {
        initialValue: settings.project.avgChart.latitudeRanges,
        rules: [{
          type: 'array',
          // fields: {
          //   0: {type: "object", required: true},
          //   1: {type: "object", required: true},
          // },
          message: 'Please add latitude range!'
        }]
      }
    };
  };

  render() {
    const {getFieldError, getFieldValue, setFieldsValue} = this.props.form;
    const {settings} = this.props;
    let rules = {};

    if (this.state.modalVisible) {
      rules = this.getValidationRules();
    }

    let wrappedField = (name) => {
      return this.props.form.getFieldDecorator(name, rules[name]);
    };

    const ScaleTypeSelect = (
      <Select style={{width: 60}} size={this.props.size}>
        <Select.Option value={`true`}>auto</Select.Option>
        <Select.Option value={`false`}>fixed</Select.Option>
      </Select>
    );

    const InputGroup = (props) => {
      return (
        <Form.Item
          {...formItemLayout}
          label={props.label}
          validateStatus={getFieldError(props.name) ? 'error' : 'success'}
          help={getFieldError(props.name)}
        >
          <Input.Group size={this.props.size} className="custom-group" compact>
            {props.addonBefore}
            {wrappedField(props.name)(
              <InputNumber
                style={{width: 100}}
                disabled={props.disabled !== undefined ? props.disabled : false}
                placeholder="Scale"
                size={this.props.size}
                onKeyDown={this.handlerInputNumberFix}
              />
            )}
            <span className="ant-input-group-addon">{props.addonAfter}</span>
          </Input.Group>
        </Form.Item>
      );
    };

    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 6},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      },
    };

    // onOpenChange={(status) => this.handlerDatePickerOpenChange(status)}

    let tabsKey = 1;

    return (
      <Input.Group size={this.props.size} compact>
        <Button icon="setting" size={this.props.size} onClick={this.handlerModalOpen}></Button>
        <Modal
          wrapClassName="main-page-settings"
          width={700}
          title={(<span><Icon type="setting"/> Settings</span>)}
          onCancel={this.handlerReset}
          onOk={this.handlerSave}
          visible={this.state.modalVisible}
          maskClosable={false}
        >
          <Form>
            <Tabs tabPosition="left" defaultActiveKey="1">
              <Tabs.TabPane
                key={tabsKey++}
                tab={(<span><Icon type="layout"/>Application</span>)}
                style={{height: this.state.modalHeight}}
              >
                {!localStorage[app.LS_KEY_APP_SETTINGS] && <Alert message="This is global settings" type="warning" showIcon/>}
                <Form.Item {...formItemLayout} label="Theme">
                  {wrappedField('app.theme')(
                    <Select size={this.props.size} style={{width: 150}}>
                      {app.THEMES.map((item, i) => {
                        return <Select.Option value={item.toCamelCase()} key={i}>{item}</Select.Option>;
                      })}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Language">
                  {wrappedField('app.language')(
                    <Select size={this.props.size} style={{width: 150}} disabled>
                      {app.LANGUAGES.map((item, i) => {
                        return <Select.Option value={item.code} key={i}>{item.name}</Select.Option>;
                      })}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Anti-aliasing">
                  {wrappedField('app.antiAliasing')(
                    <Switch size={this.props.size}/>
                  )}
                </Form.Item>
                <fieldset>
                  <legend>Time</legend>
                  <div>
                    {InputGroup({
                      label: "Shift step",
                      name: "app.time.shiftStep",
                      addonAfter: `× ${settings.project.time.avg.value} ${settings.project.time.avg.by}`
                    })}
                    {InputGroup({
                      label: "Play delay",
                      name: "app.time.playDelay",
                      addonAfter: "seconds"
                    })}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Map</legend>
                  <div>
                    <Form.Item {...formItemLayout} label="World scale">
                      {wrappedField('app.mapLayer.world.scale')(
                        <Select size={this.props.size} style={{width: 150}}>
                          {app.MAP_WORLD_SCALE.map((item, i) => {
                            return <Select.Option value={item} key={i}>{item}</Select.Option>;
                          })}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Default projection">
                      {wrappedField('app.mapLayer.projectionType')(
                        <Select size={this.props.size} style={{width: 150}}>
                          {app.MAP_PROJECTION.map((item, i) => {
                            return <Select.Option value={item.toCamelCase()} key={i}>{item}</Select.Option>;
                          })}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Show countries">
                      {wrappedField('app.mapLayer.world.countries')(
                        <Switch size={this.props.size}/>
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Water color">
                      <Col span={6}>
                        {wrappedField('app.mapLayer.world.color.water')(
                          <Input placeholder="Color" size={this.props.size}/>
                        )}
                      </Col>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Land color">
                      <Col span={6}>
                        {wrappedField('app.mapLayer.world.color.land')(
                          <Input placeholder="Color" size={this.props.size}/>
                        )}
                      </Col>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Borders color">
                      <Col span={6}>
                        {wrappedField('app.mapLayer.world.color.border')(
                          <Input placeholder="Color" size={this.props.size}/>
                        )}
                      </Col>
                    </Form.Item>
                  </div>
                </fieldset>
              </Tabs.TabPane>
              <Tabs.TabPane
                key={tabsKey++}
                tab={(<span><Icon type="clock-circle"/>Time</span>)}
                style={{height: this.state.modalHeight}}
              >
                <Form.Item {...formItemLayout} label="Time">
                  {wrappedField('project.time.period')(
                    <SettingsDataTimeRage
                      size={this.props.size}
                    />
                  )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Selected time">
                  {wrappedField('project.time.selected')(
                    <SettingsDataTimeRage
                      size={this.props.size}
                      valueLimit={getFieldValue('time.period')}
                    />
                  )}
                </Form.Item>
                <br/>
              </Tabs.TabPane>
              <Tabs.TabPane
                key={tabsKey++}
                tab={(<span><Icon type="global"/>Map</span>)}
                style={{height: this.state.modalHeight}}
              >
                <fieldset>
                  <legend>ΔH {wrappedField('project.mapLayer.dH.enabled')(<Switch size={this.props.size}/>)}</legend>
                  <div className={getFieldValue('project.mapLayer.dH.enabled') ? 'show' : 'hide'}>
                    {InputGroup({
                      label: "Scale",
                      name: "project.mapLayer.dH.scale",
                      disabled: getFieldValue('project.mapLayer.dH.scaleAuto') === 'true',
                      addonAfter: "nT",
                      addonBefore: wrappedField('project.mapLayer.dH.scaleAuto')({...ScaleTypeSelect})
                    })}
                    <Form.Item {...formItemLayout} label="Color">
                      <Col span={6}>
                        <Input placeholder="Color" size={this.props.size}/>
                      </Col>
                    </Form.Item>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>ΔZ {wrappedField('project.mapLayer.dZ.enabled')(<Switch size={this.props.size}/>)}</legend>
                  <div className={getFieldValue('project.mapLayer.dZ.enabled') ? 'show' : 'hide'}>
                    {InputGroup({
                      label: "Scale",
                      name: "project.mapLayer.dZ.scale",
                      disabled: getFieldValue('project.mapLayer.dZ.scaleAuto') === 'true',
                      addonAfter: "nT",
                      addonBefore: wrappedField('project.mapLayer.dZ.scaleAuto')({...ScaleTypeSelect})
                    })}
                    <Form.Item {...formItemLayout} label="View">
                      {wrappedField('project.mapLayer.dZ.view')(
                        <Radio.Group>
                          <Radio.Button value="circle">
                            <div className="dz-view-select circle">
                              <div className="positive"></div>
                              <div className="negative"></div>
                            </div>
                          </Radio.Button>
                          <Radio.Button value="circleGradient">
                            <div className="dz-view-select circle-gradient">
                              <div className="positive"></div>
                              <div className="negative"></div>
                            </div>
                          </Radio.Button>
                          <Radio.Button value="square">
                            <div className="dz-view-select square">
                              <div className="positive"></div>
                              <div className="negative"></div>
                            </div>
                          </Radio.Button>
                        </Radio.Group>
                      )}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Color">
                      <Col span={12}>
                        <Input.Group size={this.props.size} compact>
                          <Input placeholder="Color" style={{width: '50%'}} size={this.props.size}/>
                          <Input placeholder="Color" style={{width: '50%'}} size={this.props.size}/>
                        </Input.Group>
                      </Col>
                    </Form.Item>
                  </div>
                </fieldset>
              </Tabs.TabPane>
              <Tabs.TabPane
                key={tabsKey++}
                tab={<span><Icon type="line-chart"/>Charts</span>}
                style={{height: this.state.modalHeight}}
              >
                {wrappedField('project.avgChart.lines')(
                  <SettingsAvgChartLines
                    onCellChange={(field, index, value) => {
                      let lines = getFieldValue('project.avgChart.lines');
                      lines[index][field] = value;
                      setFieldsValue({'avgChart.lines': lines});
                    }}
                    onLineAdd={() => {
                      let lines = getFieldValue('project.avgChart.lines');
                      lines.push({comp: null, hemisphere: null, style: null, enabled: true});
                      setFieldsValue({'avgChart.lines': lines});
                    }}
                    onLineRemove={(index) => {
                      let lines = getFieldValue('project.avgChart.lines');
                      lines.remove(index);
                      setFieldsValue({'project.avgChart.lines': lines});
                    }}
                  />
                )}
                <br/>
                {wrappedField('project.avgChart.latitudeRanges')(
                  <SettingsAvgChartLatitudes
                    onCellChange={(field, index, value) => {
                      let ranges = getFieldValue('project.avgChart.latitudeRanges');
                      ranges[index][field] = value;
                      setFieldsValue({'project.avgChart.latitudeRanges': ranges});
                    }}
                    onLineAdd={() => {
                      let ranges = getFieldValue('project.avgChart.latitudeRanges');
                      ranges.push({comp: null, hemisphere: null, style: null, enabled: true});
                      setFieldsValue({'project.avgChart.latitudeRanges': ranges});
                    }}
                    onLineRemove={(index) => {
                      let ranges = getFieldValue('project.avgChart.latitudeRanges');
                      ranges.remove(index);
                      setFieldsValue({'project.avgChart.latitudeRanges': ranges});
                    }}
                  />
                )}
              </Tabs.TabPane>
            </Tabs>
          </Form>
        </Modal>
      </Input.Group>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.main.settings,
    maximum: state.station.maximum
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch),
  };
}

const WrappedSettingsForm = Form.create({
  // mapPropsToFields: (props) => {
  //   console.log(props.settings.avgChart.lines);
  //   return {
  //     'avgChart.lines': props.settings.avgChart.lines,
  //   }
  // },
  // onFieldsChange: (props, fields) => {
  //   console.log('onFieldsChange', {props, fields});
  // },
})(Settings);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSettingsForm);

// const WrappedSettingsForm = connect(mapStateToProps, mapDispatchToProps)(Settings);
// export default Form.create({
//   mapPropsToFields(props) {
//     console.log(props.formState);
//     return {
//       // 'avgChart.lines': props
//     }
//   }
// })(WrappedSettingsForm);
