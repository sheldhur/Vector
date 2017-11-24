import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Modal, Icon, Button, Input, InputNumber, Select, Radio, Form, Switch, Tabs, Col, Alert} from "antd";
import * as MainActions from "./../../actions/main";
import * as MagnetopauseActions from "./../../actions/magnetopause";
import "./../../utils/helper";


class MagnetopauseSettings extends Component {
  state = {
    modalVisible: this.props.modalVisible
  };

  // componentWillReceiveProps = (nextProps) => {
  //   if (nextProps.hasOwnProperty('modalVisible')) {
  //     this.setState({modalVisible: nextProps.modalVisible});
  //   }
  // };

  handlerModalOpen = () => {
    this.setState({modalVisible: true});
  };

  handlerModalClose = () => {
    this.setState({modalVisible: false}, () => {
      this.props.magnetopauseActions.calculateMagnetopause();
    });
  };

  handlerReset = (e) => {
    this.props.mainActions.loadSettings().then(() => {
      this.handlerModalClose();
    });
  };

  handlerSave = (e) => {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();

    console.log(values.magnetopause);

    for (let field in values.magnetopause) {
        values.magnetopause[field] = values.magnetopause[field] ? parseInt(values.magnetopause[field]) : null;
    }

    this.props.mainActions.saveSettings(values).then(() => {
      this.handlerModalClose();
    });
  };

  getValidationRules = () => {
    const {settings, maximum} = this.props;
    const {setFieldsValue} = this.props.form;

    return {
      'project.magnetopause.b': {
        initialValue: settings.project.magnetopause.b ? settings.project.magnetopause.b.toString() : settings.project.magnetopause.b,
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'project.magnetopause.b': value === undefined ? null : value
            })
          }
        }]
      },
      'project.magnetopause.bz': {
        initialValue: settings.project.magnetopause.bz ? settings.project.magnetopause.bz.toString() : settings.project.magnetopause.bz,
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'project.magnetopause.bz': value === undefined ? null : value
            })
          }
        }]
      },
      'project.magnetopause.pressureSolar': {
        initialValue: settings.project.magnetopause.pressureSolar ? settings.project.magnetopause.pressureSolar.toString() : settings.project.magnetopause.pressureSolar,
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'project.magnetopause.pressureSolar': value === undefined ? null : value
            })
          }
        }]
      },
    };
  };

  render = () => {
    const {getFieldError, getFieldValue, setFieldsValue} = this.props.form;
    const {settings, dataSets} = this.props;
    let rules = {};

    if (this.state.modalVisible) {
      rules = this.getValidationRules();
    }

    let wrappedField = (name) => {
      return this.props.form.getFieldDecorator(name, rules[name]);
    };

    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      },
    };

    const DataSetSelector = (props) => {
      return (
        <Form.Item {...formItemLayout} label={props.label}>
          {wrappedField(props.name)(
            <Select size={this.props.size} allowClear={true}>
              {dataSets.map((item) => {
                return (
                  <Select.Option value={item.id.toString()} key={item.id} title={item.name}>
                    {item.name} ({item.si})
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
      )
    };

    return (
      <Input.Group size={this.props.size} compact>
        <Button icon="setting" size={this.props.size} onClick={this.handlerModalOpen}></Button>
        <Modal
          wrapClassName="main-page-settings"
          width={460}
          title={(<span><Icon type="setting"/> Settings</span>)}
          onCancel={this.handlerReset}
          onOk={this.handlerSave}
          visible={this.state.modalVisible}
          maskClosable={false}
        >
          <Form>
            {DataSetSelector({name: "project.magnetopause.b", label: "B (nT)"})}
            {DataSetSelector({name: "project.magnetopause.bz", label: (<span>B<sub>z</sub> (nT)</span>)})}
            {DataSetSelector({name: "project.magnetopause.pressureSolar", label: "Solar pressure (nPa)"})}
          </Form>
        </Modal>
      </Input.Group>
    );
  }
}

MagnetopauseSettings.propTypes = {
  modalVisible: PropTypes.bool,
};

MagnetopauseSettings.defaultProps = {
  modalVisible: false
};

function mapStateToProps(state) {
  return {
    settings: state.main.settings,
    maximum: state.station.maximum,
    dataSets: Object.values(state.dataSet.dataSets),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch),
    magnetopauseActions: bindActionCreators(MagnetopauseActions, dispatch),
  };
}

const WrappedSettingsForm = Form.create({
  // onFieldsChange: (props, fields) => {
  //   console.log('onFieldsChange', {props, fields});
  // },
})(MagnetopauseSettings);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSettingsForm);
