// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {NoDataAlert, ProgressAlert} from '../widgets/ChartAlert';
import LineChart from '../chart/LineChart';
import TitleCurrentTime from '../main/TitleCurrentTime';
import * as MainActions from '../../actions/main';
import * as DataSetActions from '../../actions/dataSet';
import * as app from '../../constants/app';
import * as prepareData from '../../utils/prepareData';


class DataSetValuesChart extends Component {

  prepareDataForChart = (dataSet, dataSetValue) => {
    const colorGroup = app.DATA_SET_COLOR;

    if (dataSet === undefined) {
      return [];
    }

    let chartGroups = {};
    if (dataSet && dataSet.status === app.DATASET_ENABLED) {
      let dataSetLine = {
        name: dataSet.name,
        si: dataSet.si,
        format: '%(name)s: %(y).5g %(si)s',
        style: {
          stroke: colorGroup[1 % colorGroup.length],
          strokeWidth: 1,
          ...dataSet.style
        },
        points: dataSetValue ? dataSetValue.map((dataSetValue) => {
          return {
            x: dataSetValue.time,
            y: !dataSet.badValue || Math.abs(dataSetValue.value) < dataSet.badValue ? dataSetValue.value : null
          };
        }) : []
      };

      if (chartGroups[dataSet.axisGroup] === undefined) {
        chartGroups[dataSet.axisGroup] = {
          si: null,
          lines: [],
        };
      }

      chartGroups[dataSet.axisGroup].lines.push(dataSetLine);
      chartGroups[dataSet.axisGroup].si = chartGroups[dataSet.axisGroup].si || dataSetLine.si;
    }

    return Object.values(chartGroups);
  };

  render() {
    const {dataSetId, isLoading, isError, progress, dataSets, dataSetValues} = this.props;
    const chartLines = prepareData.dataSetsForChart(dataSets, dataSetValues, (dataSet) => dataSet.id == dataSetId);

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

DataSetValuesChart.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

DataSetValuesChart.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    progress: state.dataSet.progress,
    isLoading: state.dataSet.isLoading,
    isError: state.dataSet.isError,
    dataSets: state.dataSet.dataSets,
    dataSetValues: state.dataSet.dataSetValues,
    antiAliasing: state.main.settings.appAntiAliasing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mainActions: bindActionCreators(MainActions, dispatch),
    dataSetActions: bindActionCreators(DataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetValuesChart);
