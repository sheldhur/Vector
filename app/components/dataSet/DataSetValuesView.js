// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Row} from 'antd';
import DataSetValueActions from './DataSetValueActions';
import DataSetValuesChart from './DataSetValuesChart';
import DataSetValuesGrid from './DataSetValuesGrid';


class DataSetValuesView extends Component {

  shouldComponentUpdate(nextProps) {
    if (nextProps.location.action === 'POP') {
      // return false;
    }

    return true;
  }

  render() {
    return (
      <div className={`dataset-values-view theme-${this.props.theme}`}>
        <Row style={{height:'150px'}}>
          <DataSetValuesChart dataSetId={this.props.params.id} />
        </Row>
        <Row>
          <DataSetValueActions dataSetId={this.props.params.id}/>
        </Row>
        <Row>
          <DataSetValuesGrid dataSetId={this.props.params.id} />
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

export default connect(mapStateToProps, null)(DataSetValuesView);
