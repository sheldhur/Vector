// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MainHeader from './MainHeader';
import MainDashboard from './MainDashboard';
import {LoadingAlert, ErrorAlert} from '../widgets/ChartAlert';


class Main extends Component {
  render() {
    if (this.props.isError) {
      return (<ErrorAlert
        className={`theme-${this.props.theme}`}
        text={this.props.isError.name}
        description={this.props.isError.message}
      />);
    }

    if (this.props.isLoading) {
      return (<LoadingAlert className={`theme-${this.props.theme}`}/>);
    }

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
    theme: state.main.settings.appTheme,
    isLoading: state.main.isLoading,
    isError: state.main.isError,
  };
}

export default connect(mapStateToProps, null)(Main);
