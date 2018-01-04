import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import MapChart from '../chart/MapChart';
import VectorMapMenu from './VectorMapMenu';
import * as stationActions from '../../actions/station';
import { numberIsBetween } from '../../utils/helper';


class VectorMapChart extends Component {
  state = {
    stereographicClipAngle: 45,
    stereographicRotate: 0,
    projectionType: this.props.mapProjectionType
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.mapProjectionType !== this.props.mapProjectionType) {
      this.setState({ projectionType: nextProps.mapProjectionType });
    }
  };

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      const mapLayer = {};
      const props = { ...mapLayer, ...this.state };

      VectorMapMenu({
        state: props,
        setState: (state) => this.setState(state),
        stationActions: this.props.stationActions,
        dataNotEmpty: true,
      });
    }
  };

  handlerWheel = (e) => {
    if (e.ctrlKey) {
      const stereographicRotate = this.state.stereographicRotate + ((e.deltaY / 100) * 5);
      this.setState({ stereographicRotate });
    } else {
      const stereographicClipAngle = this.state.stereographicClipAngle + ((e.deltaY / 100) * 5);
      if (numberIsBetween(stereographicClipAngle, [10, 170])) {
        this.setState({ stereographicClipAngle });
      }
    }
  };

  render = () => {
    const {
      antiAliasing, mapScale, mapCountries, mapColor
    } = this.props;
    const props = {
      antiAliasing,
      world: {
        scale: mapScale,
        countries: mapCountries,
        color: mapColor,
      },
      ...this.state
    };

    return (
      <div
        style={{ height: '100%', padding: '5px' }}
        onContextMenu={this.handlerContextMenu}
        id="mapChart"
        onWheel={this.handlerWheel}
      >
        <MapChart
          width="100%"
          height="100%"
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
