import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Icon, Button, Input, InputNumber, Select, Radio, Form, Switch, Tabs, Col, Alert } from 'antd';
import moment from 'moment';
import SettingsAvgChartLines from './SettingsAvgChartLines';
import SettingsAvgChartLatitudes from './SettingsAvgChartLatitudes';
import SettingsDataTimeRage from './SettingsDataTimeRage';
import SettingsInputColor from './SettingsInputColor';
import * as mainActions from './../../actions/main';
import * as dataSetActions from '../../actions/dataSet';
import * as stationActions from '../../actions/station';
import * as app from './../../constants/app';
import { stringCamelCase, numberIsBetween } from '../../utils/helper';


class Settings extends Component {
  state = {
    modalVisible: false,
    modalHeight: 250,
  };

  componentWillMount = () => {
    this.calcModalHeight();
    window.addEventListener('resize', this.calcModalHeight);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.calcModalHeight);
  };

  calcModalHeight = () => {
    let modalHeight = ((window.innerHeight / 100) * 50) - 50;
    if (modalHeight < 250) {
      modalHeight = 250;
    }

    this.setState({ modalHeight });
  };

  createRange = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  // TODO: время для сегодняшнего дня
  disabledRangeTime = (current, type, range) => {
    const disabled = {
      disabledSeconds: () => {
        const seconds = [...Array(60).keys()];
        seconds.shift();

        return seconds;
      }
    };

    if (range && Array.isArray(current) && current[type === 'start' ? 0 : 1].format('YYYY-MM-DD') === range[type].format('YYYY-MM-DD')) {
      const rangeHour = range[type].hour();
      const rangeMinute = range[type].minute();
      disabled.disabledHours = () => (type === 'start' ? this.createRange(0, rangeHour) : this.createRange(rangeHour + 1, 24));
      disabled.disabledMinutes = (selectedHour) => {
        if (selectedHour === rangeHour) {
          return type === 'start' ? this.createRange(0, rangeMinute) : this.createRange(rangeMinute + 1, 60);
        }
      };
    }

    return disabled;
  };

  disabledRangeDate = (current, range) => {
    const currentDate = current.clone().startOf('date');
    const rangeDate = range ? {
      start: range.start.clone().startOf('date'),
      end: range.end.clone().startOf('date'),
    } : null;
    const nowDate = moment().startOf('date');

    return this.filterRangeDataTime(currentDate, rangeDate, nowDate);
  };

  filterRangeDataTime = (current, range, now) => {
    let result = true;
    if (current) {
      const currentMs = current.valueOf();
      if (range) {
        const rangeMs = [
          range.start.valueOf(),
          range.end.valueOf()
        ];
        result = !numberIsBetween(currentMs, rangeMs);
      } else {
        const nowMs = now.valueOf();
        result = current > nowMs;
      }
    }

    return result;
  };

  handlerModalOpen = () => {
    this.setState({ modalVisible: true });
  };

  handlerModalClose = (callback) => {
    this.setState({ modalVisible: false }, callback);
  };

  handlerReset = (e) => {
    this.handlerModalClose(() => {
      this.props.form.resetFields();
    });
  };

  handlerSave = (e) => {
    e.preventDefault();
    const { settings } = this.props;
    const values = this.props.form.getFieldsValue();

    values.projectMapLayerH.scaleAuto = values.projectMapLayerH.scaleAuto === 'true';
    values.projectMapLayerZ.scaleAuto = values.projectMapLayerZ.scaleAuto === 'true';

    this.props.mainActions.saveSettings(values).then(() => {
      if (
        JSON.stringify(settings.projectTimePeriod) !== JSON.stringify(values.projectTimePeriod) ||
        JSON.stringify(settings.projectTimeSelected) !== JSON.stringify(values.projectTimeSelected)
      ) {
        this.props.dataSetActions.getData();
        this.props.stationActions.getLatitudeAvgValues();
      } else if (
        JSON.stringify(settings.projectAvgComponentLines.filter((item) => item.enabled)) !== JSON.stringify(values.projectAvgComponentLines.filter((item) => item.enabled)) ||
        JSON.stringify(settings.projectAvgLatitudeRanges) !== JSON.stringify(values.projectAvgLatitudeRanges)
      ) {
        this.props.stationActions.getLatitudeAvgValues();
      }

      this.handlerModalClose();
    });
  };

  handlerInputNumberFix = (e) => {
    if (numberIsBetween(e.keyCode, [65, 90])) {
      e.preventDefault();
    }
  };

  handlerDatePickerOpenChange = (status) => {
    if (!status) {
      this.props.form.resetFields(['time.period', 'time.selected']);
    }
  };

  getValidationRules = () => {
    const { settings, maximum } = this.props;
    const { setFieldsValue } = this.props.form;

    return {
      appTheme: {
        initialValue: settings.appTheme,
        rules: [{
          type: 'string'
        }],
      },
      appLanguage: {
        initialValue: settings.appLanguage,
        rules: [{
          type: 'string'
        }],
      },
      appAntiAliasing: {
        initialValue: settings.appAntiAliasing,
        valuePropName: 'checked'
      },
      appMapScale: {
        initialValue: settings.appMapScale,
        rules: [{
          type: 'string'
        }],
      },
      appMapProjectionType: {
        initialValue: settings.appMapProjectionType,
        rules: [{
          type: 'string'
        }],
      },
      appMapCountries: {
        initialValue: settings.appMapCountries,
        valuePropName: 'checked'
      },
      'appMapColor.water': {
        initialValue: settings.appMapColor.water,
        rules: [{
          type: 'float', message: 'Is not a integer!'
        }],
      },
      'appMapColor.land': {
        initialValue: settings.appMapColor.land,
        rules: [{
          type: 'float', message: 'Is not a integer!'
        }],
      },
      'appMapColor.border': {
        initialValue: settings.appMapColor.border,
        rules: [{
          type: 'float', message: 'Is not a integer!'
        }],
      },
      appTimeShiftStep: {
        initialValue: settings.appTimeShiftStep,
        rules: [{
          type: 'integer', message: 'Is not a integer!',
        }]
      },
      appPlayDelay: {
        initialValue: settings.appPlayDelay,
        rules: [{
          type: 'integer', message: 'Is not a integer!',
        }]
      },
      projectTimePeriod: {
        initialValue: [...settings.projectTimePeriod].map(item => moment(item)),
        rules: [{
          type: 'array',
          fields: {
            0: { type: 'object', required: true },
            1: { type: 'object', required: true },
          },
          message: 'Please select time!',
          transform: (value) => {
            setFieldsValue({
              projectTimePeriod: value.map(item => item.seconds(0).millisecond(0))
            });
          }
        }]
      },
      projectTimeSelected: {
        initialValue: [...settings.projectTimeSelected].map(item => moment(item)),
        rules: [{
          type: 'array',
          fields: {
            0: { type: 'object', required: true },
            1: { type: 'object', required: true },
          },
          message: 'Please select time!',
          transform: (value) => {
            setFieldsValue({
              projectTimeSelected: value.map(item => item.seconds(0).millisecond(0))
            });
          }
        }],
      },
      'projectMapLayerH.enabled': {
        initialValue: settings.projectMapLayerH.enabled,
        valuePropName: 'checked'
      },
      'projectMapLayerZ.enabled': {
        initialValue: settings.projectMapLayerZ.enabled,
        valuePropName: 'checked'
      },
      'projectMapLayerH.scaleAuto': {
        initialValue: settings.projectMapLayerH.scaleAuto.toString(),
        type: 'boolean',
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'projectMapLayerH.scale': value !== 'true' ? settings.projectMapLayerH.scale : (maximum ? maximum.dH : NaN)
            });
          }
        }]
      },
      'projectMapLayerZ.scaleAuto': {
        initialValue: settings.projectMapLayerZ.scaleAuto.toString(),
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'projectMapLayerZ.scale': value !== 'true' ? settings.projectMapLayerZ.scale : (maximum ? maximum.dZ : NaN)
            });
          }
        }]
      },
      'projectMapLayerH.scale': {
        initialValue: !settings.projectMapLayerH.scaleAuto ? settings.projectMapLayerH.scale : (maximum ? maximum.dH : NaN),
        rules: [{
          type: 'number', message: 'Is not a integer!',
        }]
      },
      'projectMapLayerZ.scale': {
        initialValue: !settings.projectMapLayerZ.scaleAuto ? settings.projectMapLayerZ.scale : (maximum ? maximum.dZ : NaN),
        rules: [{
          type: 'number', message: 'Is not a integer!',
        }]
      },
      'projectMapLayerZ.view': {
        initialValue: settings.projectMapLayerZ.view,
      },
      projectAvgComponentLines: {
        initialValue: settings.projectAvgComponentLines.map(item => ({ ...item })),
        rules: [{
          type: 'array',
          // fields: {
          //   0: {type: "object", required: true},
          //   1: {type: "object", required: true},
          // },
          message: 'Please add lines!'
        }]
      },
      projectAvgLatitudeRanges: {
        initialValue: settings.projectAvgLatitudeRanges.map(item => [...item]),
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

  render = () => {
    const { getFieldError, getFieldValue, setFieldsValue } = this.props.form;
    const { settings } = this.props;
    let rules = {};

    if (this.state.modalVisible) {
      rules = this.getValidationRules();
    }

    const wrappedField = (name) => this.props.form.getFieldDecorator(name, rules[name]);

    const ScaleTypeSelect = (
      <Select style={{ width: 65 }} size={this.props.size}>
        <Select.Option value="true">auto</Select.Option>
        <Select.Option value="false">fixed</Select.Option>
      </Select>
    );

    const InputGroup = (props) => (
      <Form.Item
        {...formItemLayout}
        label={props.label}
        validateStatus={getFieldError(props.name) ? 'error' : 'success'}
        help={getFieldError(props.name)}
      >
        <Input.Group size={this.props.size} className="custom-group" compact>
          {props.addonBefore}
          {wrappedField(props.name)(<InputNumber
            style={{ width: 100 }}
            disabled={props.disabled !== undefined ? props.disabled : false}
            placeholder="Scale"
            size={this.props.size}
            onKeyDown={this.handlerInputNumberFix}
          />)}
          <span className="ant-input-group-addon">{props.addonAfter}</span>
        </Input.Group>
      </Form.Item>
    );

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

    // onOpenChange={(status) => this.handlerDatePickerOpenChange(status)}

    let tabsKey = 1;

    return (
      <Input.Group size={this.props.size} compact>
        <Button icon="setting" size={this.props.size} onClick={this.handlerModalOpen} />
        <Modal
          wrapClassName="main-page-settings"
          width={700}
          title={(<span><Icon type="setting" /> Settings</span>)}
          onCancel={this.handlerReset}
          onOk={this.handlerSave}
          visible={this.state.modalVisible}
        >
          <Form>
            <Tabs tabPosition="left" defaultActiveKey="1">
              <Tabs.TabPane
                key={tabsKey++}
                tab={(<span><Icon type="layout" />Application</span>)}
                style={{ height: this.state.modalHeight }}
              >
                {!localStorage[app.LS_KEY_APP_SETTINGS] &&
                <Alert message="This is global settings" type="warning" showIcon />}
                <Form.Item {...formItemLayout} label="Theme">
                  {wrappedField('appTheme')(<Select size={this.props.size} style={{ width: 150 }}>
                    {app.THEMES.map((item, i) => <Select.Option value={stringCamelCase(item)} key={i}>{item}</Select.Option>)}
                  </Select>)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Language">
                  {wrappedField('appLanguage')(<Select size={this.props.size} style={{ width: 150 }} disabled>
                    {app.LANGUAGES.map((item, i) => <Select.Option value={item.code} key={i}>{item.name}</Select.Option>)}
                  </Select>)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Anti-aliasing">
                  {wrappedField('appAntiAliasing')(<Switch size={this.props.size} />)}
                </Form.Item>
                <fieldset>
                  <legend>Time</legend>
                  <div>
                    {InputGroup({
                      label: 'Shift step',
                      name: 'appTimeShiftStep',
                      addonAfter: `× ${settings.projectTimeAvg.value} ${settings.projectTimeAvg.by}`
                    })}
                    {InputGroup({
                      label: 'Play delay',
                      name: 'appPlayDelay',
                      addonAfter: 'seconds'
                    })}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Map</legend>
                  <div>
                    <Form.Item {...formItemLayout} label="World scale">
                      {wrappedField('appMapScale')(<Select size={this.props.size} style={{ width: 150 }}>
                        {app.MAP_WORLD_SCALE.map((item, i) => <Select.Option value={item} key={i}>{item}</Select.Option>)}
                      </Select>)}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Default projection">
                      {wrappedField('appMapProjectionType')(<Select size={this.props.size} style={{ width: 150 }}>
                        {app.MAP_PROJECTION.map((item, i) => <Select.Option value={stringCamelCase(item)} key={i}>{item}</Select.Option>)}
                      </Select>)}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Show countries">
                      {wrappedField('appMapCountries')(<Switch size={this.props.size} />)}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Water color">
                      <Col span={6}>
                        {wrappedField('appMapColor.water')(<SettingsInputColor size={this.props.size} />)}
                      </Col>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Land color">
                      <Col span={6}>
                        {wrappedField('appMapColor.land')(<SettingsInputColor size={this.props.size} />)}
                      </Col>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Borders color">
                      <Col span={6}>
                        {wrappedField('appMapColor.border')(<SettingsInputColor size={this.props.size} />)}
                      </Col>
                    </Form.Item>
                  </div>
                </fieldset>
              </Tabs.TabPane>
              <Tabs.TabPane
                key={tabsKey++}
                tab={(<span><Icon type="clock-circle" />Time</span>)}
                style={{ height: this.state.modalHeight }}
              >
                <Form.Item {...formItemLayout} label="Time">
                  {wrappedField('projectTimePeriod')(<SettingsDataTimeRage
                    size={this.props.size}
                    onChange={(value) => {
                      const selected = getFieldValue('projectTimeSelected');
                      const newSelected = [
                        Math.max(value[0].valueOf(), selected[0].valueOf()),
                        Math.min(value[1].valueOf(), selected[1].valueOf())
                      ].map(item => moment(item));

                      setFieldsValue({ projectTimeSelected: newSelected });
                    }}
                  />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Selected time">
                  {wrappedField('projectTimeSelected')(<SettingsDataTimeRage
                    size={this.props.size}
                    valueLimit={getFieldValue('projectTimePeriod')}
                  />)}
                </Form.Item>
                <br />
              </Tabs.TabPane>
              <Tabs.TabPane
                key={tabsKey++}
                tab={(<span><Icon type="global" />Map</span>)}
                style={{ height: this.state.modalHeight }}
              >
                <fieldset>
                  <legend>ΔH {wrappedField('projectMapLayerH.enabled')(<Switch size={this.props.size} />)}</legend>
                  <div className={getFieldValue('projectMapLayerH.enabled') ? 'show' : 'hide'}>
                    {InputGroup({
                      label: 'Scale',
                      name: 'projectMapLayerH.scale',
                      disabled: getFieldValue('projectMapLayerH.scaleAuto') === 'true',
                      addonAfter: 'nT',
                      addonBefore: wrappedField('projectMapLayerH.scaleAuto')({ ...ScaleTypeSelect })
                    })}
                    <Form.Item {...formItemLayout} label="Color">
                      <Col span={6}>
                        <Input placeholder="Color" size={this.props.size} />
                      </Col>
                    </Form.Item>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>ΔZ {wrappedField('projectMapLayerZ.enabled')(<Switch size={this.props.size} />)}</legend>
                  <div className={getFieldValue('projectMapLayerZ.enabled') ? 'show' : 'hide'}>
                    {InputGroup({
                      label: 'Scale',
                      name: 'projectMapLayerZ.scale',
                      disabled: getFieldValue('projectMapLayerZ.scaleAuto') === 'true',
                      addonAfter: 'nT',
                      addonBefore: wrappedField('projectMapLayerZ.scaleAuto')({ ...ScaleTypeSelect })
                    })}
                    <Form.Item {...formItemLayout} label="View">
                      {wrappedField('projectMapLayerZ.view')(<Radio.Group>
                        <Radio.Button value="circle">
                          <div className="dz-view-select circle">
                            <div className="positive" />
                            <div className="negative" />
                          </div>
                        </Radio.Button>
                        <Radio.Button value="circleGradient">
                          <div className="dz-view-select circle-gradient">
                            <div className="positive" />
                            <div className="negative" />
                          </div>
                        </Radio.Button>
                        <Radio.Button value="square">
                          <div className="dz-view-select square">
                            <div className="positive" />
                            <div className="negative" />
                          </div>
                        </Radio.Button>
                      </Radio.Group>)}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="Color">
                      <Col span={12}>
                        <Input.Group size={this.props.size} compact>
                          <Input placeholder="Color" style={{ width: '50%' }} size={this.props.size} />
                          <Input placeholder="Color" style={{ width: '50%' }} size={this.props.size} />
                        </Input.Group>
                      </Col>
                    </Form.Item>
                  </div>
                </fieldset>
              </Tabs.TabPane>
              <Tabs.TabPane
                key={tabsKey++}
                tab={<span><Icon type="line-chart" />Charts</span>}
                style={{ height: this.state.modalHeight }}
              >
                {wrappedField('projectAvgComponentLines')(<SettingsAvgChartLines
                  onCellChange={(field, index, value) => {
                    const items = getFieldValue('projectAvgComponentLines');
                    items[index][field] = value;
                    setFieldsValue({ projectAvgComponentLines: items });
                  }}
                  onLineAdd={() => {
                    const items = getFieldValue('projectAvgComponentLines');
                    items.push({
                      comp: null, hemisphere: null, style: null, enabled: true
                    });
                    setFieldsValue({ projectAvgComponentLines: items });
                  }}
                  onLineRemove={(index) => {
                    const items = getFieldValue('projectAvgComponentLines');
                    items.splice(index, 1);
                    setFieldsValue({ projectAvgComponentLines: items });
                  }}
                />)}
                <br />
                {wrappedField('projectAvgLatitudeRanges')(<SettingsAvgChartLatitudes
                  onCellChange={(field, index, value) => {
                    const items = getFieldValue('projectAvgLatitudeRanges');
                    items[index][field] = value;
                    setFieldsValue({ projectAvgLatitudeRanges: items });
                  }}
                  onLineAdd={() => {
                    const items = getFieldValue('projectAvgLatitudeRanges');
                    items.push([null, null]);
                    setFieldsValue({ projectAvgLatitudeRanges: items });
                  }}
                  onLineRemove={(index) => {
                    const items = getFieldValue('projectAvgLatitudeRanges');
                    items.splice(index, 1);
                    setFieldsValue({ projectAvgLatitudeRanges: items });
                  }}
                />)}
              </Tabs.TabPane>
            </Tabs>
          </Form>
        </Modal>
      </Input.Group>
    );
  };
}

function mapStateToProps(state) {
  return {
    settings: state.main.settings,
    maximum: state.station.maximum
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(mainActions, dispatch),
    dataSetActions: bindActionCreators(dataSetActions, dispatch),
    stationActions: bindActionCreators(stationActions, dispatch),
  };
}

const WrappedSettingsForm = Form.create({})(Settings);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSettingsForm);
