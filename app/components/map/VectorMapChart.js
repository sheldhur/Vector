// @flow
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MapChart from './../chart/MapChart';
import VectorMapMenu from './VectorMapMenu';
import * as StationActions from './../../actions/station';


class VectorMapChart extends Component {
  state = {};

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      let {mapLayer} = this.props.settings.app;
      let props = {...mapLayer, ...this.state};

      VectorMapMenu({
        state: props,
        setState: (state) => this.setState(state),
        stationActions: this.props.stationActions,
        dataNotEmpty: true,
      });
    }
  };

  render = () => {
    let {mapLayer, antiAliasing} = this.props.settings.app;
    let props = {...mapLayer, antiAliasing, ...this.state};

    return (
      <div style={{height: "100%", padding: '5px'}} onContextMenu={this.handlerContextMenu} id="mapChart">
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
    settings: state.main.settings,
    // test: state.main.settings,
    // worldScale: state.main.settings.app.mapLayer.worldScale,
    // projectionType: state.main.settings.app.mapLayer.projectionType,
    // showCountries: state.main.settings.app.mapLayer.showCountries,
    // color: state.main.settings.app.mapLayer.color,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationActions: bindActionCreators(StationActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(VectorMapChart);
