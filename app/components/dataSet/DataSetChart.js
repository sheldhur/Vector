// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {ProgressAlert, NoDataAlert} from '../widgets/ChartAlert';
import LineChart from '../chart/LineChart';
import TitleCurrentTime from '../main/TitleCurrentTime';
import DataSetChartMenu from './DataSetChartMenu';
import * as MainActions from '../../actions/main';
import * as DataSetActions from '../../actions/dataSet';
import * as StationActions from '../../actions/station';
import * as prepareData from '../../utils/prepareData';
import * as app from '../../constants/app';


class DataSetChart extends Component {

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      let {dataSets} = this.props;

      DataSetChartMenu({
        dataNotEmpty: !!dataSets,
        dataSetActions: this.props.dataSetActions,
      });
    }
  };

  handlerMouseClick = (e) => {
    if (this.props.getStations) {
      this.props.stationActions.getStationsValue();
    }
  };

  render() {
    const {isLoading, isError, progress, dataSets, dataSetValues} = this.props;
    const chartLines = prepareData.dataSetsForChart(dataSets, dataSetValues, (dataSet) => dataSet.status === app.DATASET_ENABLED);

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
      container = (
        <div id="dataSetChart" style={{width: this.props.width, height: this.props.height}} onContextMenu={this.handlerContextMenu}>
          <LineChart
            width={this.props.width}
            height={this.props.height}
            data={chartLines}
            tooltipDelay={100}
            tooltipOnClick={this.handlerMouseClick}
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

DataSetChart.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  getStations: PropTypes.bool,
};

DataSetChart.defaultProps = {
  width: '100%',
  height: '100%',
  getStations: false,
};

function mapStateToProps(state) {
  return {
    isLoading: state.dataSet.isLoading,
    isError: state.dataSet.isError,
    progress: state.dataSet.progress,
    dataSets: state.dataSet.dataSets,
    dataSetValues: state.dataSet.dataSetValues,
    antiAliasing: state.main.settings.appAntiAliasing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch),
    dataSetActions: bindActionCreators(DataSetActions, dispatch),
    stationActions: bindActionCreators(StationActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetChart);
