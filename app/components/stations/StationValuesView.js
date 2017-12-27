// @flow
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Row} from 'antd';
import StationValueActions from './StationValueActions';
import StationValuesChart from './StationValuesChart';
import StationValuesGrid from './StationValuesGrid';
import * as uiActions from '../../actions/ui';


class StationValuesView extends Component {

  shouldComponentUpdate = (nextProps) => {
    if (nextProps.location.action === 'POP') {
      // return false;
    }

    return true;
  };

  render = () => {
    const stationId = this.props.match.params.id;

    return (
      <div className={`stations-view theme-${this.props.theme}`}>
        <Row style={{height:'175px'}}>
          <StationValuesChart />
        </Row>
        <Row>
          <StationValueActions stationId={stationId}/>
        </Row>
        <Row>
          <StationValuesGrid stationId={stationId} />
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.main.settings.appTheme,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uiActions: bindActionCreators(uiActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationValuesView);
