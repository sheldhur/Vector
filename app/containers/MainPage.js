// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Main from '../components/main/Main';
// import * as ProjectActions from '../actions/main';

function mapStateToProps(state) {
  return {
    main: state.main
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(null, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
