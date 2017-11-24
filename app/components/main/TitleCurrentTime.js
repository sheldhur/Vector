import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';


class TitleCurrentTime extends Component {
  render() {
    const {currentTime, avg} = this.props;
    const timeFormat = avg.by.startsWith('min') ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY HH:mm:ss";

    return (
      <div>{currentTime ? moment(currentTime).format(timeFormat) : 'Time not selected'}</div>
    );
  }
}

TitleCurrentTime.propTypes = {};
TitleCurrentTime.defaultProps = {};

function mapStateToProps(state) {
  return {
    avg: state.main.settings.project.time.avg,
    currentTime: state.chart.chartCurrentTime ? new Date(state.chart.chartCurrentTime) : null,
  };
}

export default connect(mapStateToProps, null)(TitleCurrentTime);
