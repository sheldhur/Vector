// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MagnetopauseHeader from './MagnetopauseHeader';
import MagnetopauseDashboard from './MagnetopauseDashboard';
import {LoadingAlert, ErrorAlert} from './../widgets/ChartAlert';


class MagnetopauseView extends Component {
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
            <MagnetopauseHeader/>
          </td>
        </tr>
        <tr>
          <td className="content" style={{position: 'relative'}}>
            <div className="box" id="mainView">
              <MagnetopauseDashboard/>
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
    isLoading: state.main.isLoading,
    isError: state.main.isError,
  };
}

export default connect(mapStateToProps, null)(MagnetopauseView);
