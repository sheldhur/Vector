// @flow
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Row, Col} from 'antd';
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
    theme: state.main.settings.app.theme,
  };
}

export default connect(mapStateToProps, null)(Stations);
