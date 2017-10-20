import React, {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';


class TitleCurrentTime extends Component {
  render() {
    const {time} = this.props;

    return (
      <div>{time ? moment(this.props.time).format("DD-MM-YYYY HH:mm") : 'Time not selected'}</div>
    );
  }
}

TitleCurrentTime.propTypes = {};
TitleCurrentTime.defaultProps = {};

function mapStateToProps(state) {
  return {
    time: state.chart.chartCurrentTime
  };
}

export default connect(mapStateToProps, null)(TitleCurrentTime);
