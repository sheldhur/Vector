// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {ProgressAlert, NoDataAlert} from '../widgets/ChartAlert';
import LineChart from '../chart/LineChart';
import TitleCurrentTime from '../main/TitleCurrentTime';
import * as mainActions from '../../actions/main';
import * as app from '../../constants/app';

const COMP_XYZ = 'XYZ';
const COMP_HDZ = 'HDZ';
const VIEW_RAW = 'RAW';
const VIEW_DELTA = 'VIEW_DELTA';
const VIEW_DELTA_SIMPLE = 'VIEW_DELTA_SIMPLE';


class StationValuesChart extends Component {

  state = {
    comp: COMP_XYZ,
    view: VIEW_RAW,
  };

  componentWillMount() {
    // if (!this.props.data.isLoading) {
    //   this.props.dataSetActions.getData();
    // }
  }

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();
    }
  };

  prepareValuesForChart = (values) => {
    const colorGroup = app.DATA_SET_COLOR;

    if (!values) {
      return [];
    }

    let data = {};
    let compNames = this.state.comp.split('');

    compNames.forEach((compName) => {
      data[compName] = [];
    });

    values.forEach((value) => {
      compNames.forEach((compName) => {
        let field = 'comp' + compName;
        data[compName].push({
          x: value.time,
          y: Math.abs(value[field]) < 99999 ? value[field] : null
        });
      });
    });

    data = compNames.map((compName, compKey) => {
      return {
        si: 'nT',
        lines: [
          {
            name: compName,
            si: 'nT',
            format: '%(name)s: %(y).2f %(si)s',
            style: {
              stroke: colorGroup[compKey % colorGroup.length],
              strokeWidth: 1
            },
            points: data[compName]
          }
        ],
      }
    });

    return data;
  };

  render() {
    const {isLoading, isError, data, progress} = this.props;

    let container = null;

    if (isLoading || isError) {
      container = (<ProgressAlert
        text={progress.title}
        percent={progress.value}
        error={isError}
        onContextMenu={this.handlerContextMenu}
      />);
    }

    if (!container) {
      let chartLines = this.prepareValuesForChart(data);
      container = (
        <div style={{width: this.props.width, height: this.props.height}} onContextMenu={this.handlerContextMenu}>
          <LineChart
            width={this.props.width}
            height={this.props.height}
            data={chartLines}
            tooltipDelay={100}
            antiAliasing={this.props.antiAliasing}
            emptyMessage={<NoDataAlert onContextMenu={this.handlerContextMenu}/>}
          >
            <TitleCurrentTime/>
          </LineChart>
        </div>
      );
    }

    return container;
  }
}

StationValuesChart.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

StationValuesChart.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    isLoading: state.station.stationView.isLoading,
    isError: state.station.stationView.isError,
    progress: state.station.stationView.progress,
    data: state.station.stationView.values,
    antiAliasing: state.main.settings.appAntiAliasing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(mainActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationValuesChart);
