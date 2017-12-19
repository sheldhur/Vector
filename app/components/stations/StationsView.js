// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Row} from 'antd';
import StationsImport from './StationsImport';
import StationsGrid from './StationsGrid';


class Stations extends Component {
  render() {
    return (
      <div className={`stations-view theme-${this.props.theme}`}>
        <Row>
          <StationsImport />
        </Row>
        <Row>
          <StationsGrid />
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

export default connect(mapStateToProps, null)(Stations);
