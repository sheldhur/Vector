// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row } from 'antd';
import StationsActions from './StationsActions';
import StationsGrid from './StationsGrid';


class Stations extends Component {
  render = () => (
    <div className={`stations-view theme-${this.props.theme}`}>
      <Row>
        <StationsActions />
      </Row>
      <Row>
        <StationsGrid />
      </Row>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    theme: state.main.settings.appTheme,
  };
}

export default connect(mapStateToProps, null)(Stations);
