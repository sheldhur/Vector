// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Row} from 'antd';
import StationValueActions from './StationValueActions';
import StationValuesChart from './StationValuesChart';
import StationValuesGrid from './StationValuesGrid';


class StationValuesView extends Component {

  shouldComponentUpdate(nextProps) {
    if (nextProps.location.action === 'POP') {
      // return false;
    }

    return true;
  }

  render() {
    return (
      <div className={`stations-view theme-${this.props.theme}`}>
        <Row style={{height:'150px'}}>
          <StationValuesChart />
        </Row>
        <Row>
          <StationValueActions stationId={this.props.params.id}/>
        </Row>
        <Row>
          <StationValuesGrid stationId={this.props.params.id} />
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

export default connect(mapStateToProps, null)(StationValuesView);
