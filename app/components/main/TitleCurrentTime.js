import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';


class TitleCurrentTime extends Component {
  render() {
    const {currentTime, timeAvg} = this.props;
    const timeFormat = timeAvg.by.startsWith('min') ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY HH:mm:ss";

    return (
      <div>{currentTime ? moment(currentTime).format(timeFormat) : 'Time not selected'}</div>
    );
  }
}

TitleCurrentTime.propTypes = {};
TitleCurrentTime.defaultProps = {};

function mapStateToProps(state) {
  return {
    timeAvg: state.main.settings.projectTimeAvg,
    currentTime: state.ui.chartCurrentTime ? new Date(state.ui.chartCurrentTime) : null,
  };
}

export default connect(mapStateToProps, null)(TitleCurrentTime);
