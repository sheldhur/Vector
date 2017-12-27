// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'antd';
import DataSetsActions from './DataSetsActions';
import DataSetsChart from './DataSetsChart';
import DataSetsGrid from './DataSetsGrid';


class DataSetsView extends Component {
  render() {
    return (
      <div className={`dataset-view theme-${this.props.theme}`}>
        <Row style={{ height: '150px' }}>
          <DataSetsChart />
        </Row>
        <Row>
          <DataSetsActions />
        </Row>
        <Row>
          <DataSetsGrid />
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

export default connect(mapStateToProps, null)(DataSetsView);
