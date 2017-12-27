// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MapChart from '../chart/MapChart';
import VectorMapMenu from './VectorMapMenu';
import * as stationActions from '../../actions/station';


class VectorMapChart extends Component {
  state = {};

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      let mapLayer = {};
      let props = { ...mapLayer, ...this.state };

      VectorMapMenu({
        state: props,
        setState: (state) => this.setState(state),
        stationActions: this.props.stationActions,
        dataNotEmpty: true,
      });
    }
  };

  render = () => {
    let { antiAliasing, mapProjectionType, mapScale, mapCountries, mapColor } = this.props;
    let props = {
      antiAliasing,
      world: {
        scale: mapScale,
        countries: mapCountries,
        color: mapColor,
      },
      projectionType: mapProjectionType,
      ...this.state
    };

    return (
      <div style={{ height: "100%", padding: '5px' }} onContextMenu={this.handlerContextMenu} id="mapChart">
        <MapChart
          width={'100%'}
          height={'100%'}
          {...props}
        />
      </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    antiAliasing: state.main.settings.appAntiAliasing,
    mapProjectionType: state.main.settings.appMapProjectionType,
    mapScale: state.main.settings.appMapScale,
    mapCountries: state.main.settings.appMapCountries,
    mapColor: state.main.settings.appMapColor,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationActions: bindActionCreators(stationActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VectorMapChart);
