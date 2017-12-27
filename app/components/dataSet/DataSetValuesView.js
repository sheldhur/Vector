// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row } from 'antd';
import DataSetValueActions from './DataSetValueActions';
import DataSetValuesChart from './DataSetValuesChart';
import DataSetValuesGrid from './DataSetValuesGrid';
import * as uiActions from '../../actions/ui';


class DataSetValuesView extends Component {
  componentWillMount = () => {
    console.log(this.props);
    this.getDataSetValues(this.props);
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.getDataSetValues(nextProps);
    }
  };

  getDataSetValues = (props) => {
    const dataSetId = parseInt(props.match.params.id);

    this.props.uiActions.setGridLastOpenItem(dataSetId);
  };

  render() {
    const dataSetId = this.props.match.params.id;

    return (
      <div className={`dataset-values-view theme-${this.props.theme}`}>
        <Row style={{ height: '150px' }}>
          <DataSetValuesChart dataSetId={dataSetId} />
        </Row>
        <Row>
          <DataSetValueActions dataSetId={dataSetId} />
        </Row>
        <Row>
          <DataSetValuesGrid dataSetId={dataSetId} />
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.main.settings.appTheme,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetValuesView);
