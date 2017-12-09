import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Modal, Icon, Button, Input, Form} from "antd";
import * as MainActions from "./../../actions/main";
import * as MagnetopauseActions from "./../../actions/magnetopause";
import MagnetopauseSettingsDataSets from "./MagnetopauseSettingsDataSets";
import MagnetopauseSettingsSelector from "./MagnetopauseSettingsSelector";


class MagnetopauseSettingsChart extends Component {
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

    this.props.mainActions.saveSettings({projectMagnetopauseDataSets: values.magnetopauseDataSets}).then(() => {
      this.handlerModalClose(() => {
        this.props.magnetopauseActions.calculateMagnetopause();
      });
    });
  };

  getValidationRules = () => {
    const {magnetopauseDataSets} = this.props;
    const {setFieldsValue} = this.props.form;

    return {
      'magnetopauseDataSets': {
        initialValue: [...magnetopauseDataSets].sort(),
        rules: [{
          type: 'array',
        }]
      },
    };
  };

  render = () => {
    const {getFieldError, getFieldValue, setFieldsValue} = this.props.form;
    const {dataSets} = this.props;
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

    return (
      <Input.Group size={this.props.size} compact>
        <Button icon="area-chart" size={this.props.size} onClick={this.handlerModalOpen}></Button>
        <Modal
          wrapClassName="main-page-settings magnetopause-view-settings"
          width={460}
          title={(<span><Icon type="setting"/> Additional datasets</span>)}
          onCancel={this.handlerReset}
          onOk={this.handlerSave}
          visible={this.state.modalVisible}
        >
          <Form>
              <Form.Item {...formItemLayout} label="Add dataset">
                {wrappedField('magnetopauseDataSets')(
                  <MagnetopauseSettingsSelector
                    size={this.props.size}
                    dataSets={dataSets}
                  />
                )}
              </Form.Item>
              {wrappedField('magnetopauseDataSets')(<MagnetopauseSettingsDataSets
                dataSets={dataSets}
                onLineRemove={(index) => {
                  let items = getFieldValue('magnetopauseDataSets');
                  items.splice(index, 1);
                  setFieldsValue({'magnetopauseDataSets': items});
                }}
              />)}
          </Form>
        </Modal>
      </Input.Group>
    );
  }
}

MagnetopauseSettingsChart.propTypes = {
  modalVisible: PropTypes.bool,
};

MagnetopauseSettingsChart.defaultProps = {
  modalVisible: false
};

function mapStateToProps(state) {
  return {
    magnetopauseDataSets: state.main.settings.projectMagnetopauseDataSets,
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
})(MagnetopauseSettingsChart);
export default connect(mapStateToProps, mapDispatchToProps)(WrappedSettingsForm);
