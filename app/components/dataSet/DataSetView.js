// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Row} from 'antd';
import DataSetImport from './DataSetImport';
import DataSetChart from './DataSetChart';
import DataSetGrid from './DataSetGrid';


class DataSetView extends Component {
  render() {
    return (
      <div className={`dataset-view theme-${this.props.theme}`}>
        <Row style={{height:'150px'}}>
          <DataSetChart/>
        </Row>
        <Row>
          <DataSetImport/>
        </Row>
        <Row>
          <DataSetGrid />
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

export default connect(mapStateToProps, null)(DataSetView);
