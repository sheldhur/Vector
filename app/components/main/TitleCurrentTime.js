import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';


class TitleCurrentTime extends Component {
  render() {
    const {currentTime} = this.props;

    return (
      <div>{currentTime ? moment(currentTime).format("DD-MM-YYYY HH:mm") : 'Time not selected'}</div>
    );
  }
}

TitleCurrentTime.propTypes = {};
TitleCurrentTime.defaultProps = {};

function mapStateToProps(state) {
  return {
    currentTime: state.chart.chartCurrentTime ? new Date(state.chart.chartCurrentTime) : null,
  };
}

export default connect(mapStateToProps, null)(TitleCurrentTime);
