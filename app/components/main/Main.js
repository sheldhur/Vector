// @flow
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MainHeader from './MainHeader';
import MainDashboard from './MainDashboard';
import calcProgress from './../../lib/calcProgress'

// import './../../lib/geomagneticData/_test';


const files = new Array(4);
const rows = new Array(3600);
const currentFile = 4 - 1;
const currentRow = 1234 - 1;

console.log(calcProgress(files.length, currentFile, rows.length, currentRow));

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
