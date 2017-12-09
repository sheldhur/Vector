import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Modal, Icon, Button, Input, Select, Form} from "antd";
import * as MainActions from "./../../actions/main";
import * as MagnetopauseActions from "./../../actions/magnetopause";


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

  handlerModalClose = (callback) => {
    this.setState({modalVisible: false}, callback);
  };

  handlerReset = (e) => {
    this.handlerModalClose(() => {
      this.props.form.resetFields();
    });
  };

  handlerSave = (e) => {
    e.preventDefault();
    let values = this.props.form.getFieldsValue();

    for (let field in values) {
      values[field] = values[field] ? parseInt(values[field]) : null;
    }

    this.props.mainActions.saveSettings({projectMagnetopause: values}).then(() => {
      this.handlerModalClose(() => {
        this.props.magnetopauseActions.calculateMagnetopause();
      });
    });
  };

  getValidationRules = () => {
    const {magnetopause} = this.props;
    const {setFieldsValue} = this.props.form;

    return {
      'b': {
        initialValue: magnetopause.b ? magnetopause.b.toString() : magnetopause.b,
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'b': value === undefined ? null : value
            })
          }
        }]
      },
      'bz': {
        initialValue: magnetopause.bz ? magnetopause.bz.toString() : magnetopause.bz,
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'bz': value === undefined ? null : value
            })
          }
        }]
      },
      'pressureSolar': {
        initialValue: magnetopause.pressureSolar ? magnetopause.pressureSolar.toString() : magnetopause.pressureSolar,
        rules: [{
          transform: (value) => {
            setFieldsValue({
              'pressureSolar': value === undefined ? null : value
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
          wrapClassName="main-page-settings magnetopause-view-settings"
          width={460}
          title={(<span><Icon type="setting"/> Magnetopause settings</span>)}
          onCancel={this.handlerReset}
          onOk={this.handlerSave}
          visible={this.state.modalVisible}
        >
          <Form>
            {DataSetSelector({name: "b", label: "B (nT), GSM"})}
            {DataSetSelector({name: "bz", label: (<span>B<sub>z</sub> (nT), GSM</span>)})}
            {DataSetSelector({name: "pressureSolar", label: "Solar pressure (nPa)"})}
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
    magnetopause: state.main.settings.projectMagnetopause,
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
