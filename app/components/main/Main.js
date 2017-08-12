// @flow
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MainHeader from './MainHeader';
import MainDashboard from './MainDashboard';


class Main extends Component {
  render() {
    return (
      <table className={`main-page theme-${this.props.theme}`}>
        <tbody>
        <tr>
          <td className="header">
            <MainHeader/>
          </td>
        </tr>
        <tr>
          <td className="content" style={{position: 'relative'}}>
            <div className="box" id="mainView">
              <MainDashboard/>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.main.settings.app.theme,
  };
}

export default connect(mapStateToProps, null)(Main);
