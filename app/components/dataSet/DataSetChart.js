// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {ChartAlert} from './../widgets/ChartAlert';
import LineChart from './../chart/LineChart';
import TitleCurrentTime from './../main/TitleCurrentTime';
import DataSetChartMenu from './DataSetChartMenu';
import * as MainActions from './../../actions/main';
import * as DataSetActions from './../../actions/dataSet';
import * as StationActions from './../../actions/station';
import * as app from './../../constants/app';
import './../../utils/helper';


class DataSetChart extends Component {

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      let {data} = this.props;

      DataSetChartMenu({
        dataNotEmpty: !!data.dataSets,
        dataSetActions: this.props.dataSetActions,
      });
    }
  };

  handlerMouseClick = (e) => {
    if (this.props.getStations) {
      this.props.stationActions.getStationsValue();
    }
  };

  prepareDataForChart = (dataSets, dataSetValues) => {
    const colorGroup = app.DATA_SET_COLOR;

    let chartGroups = {};
    for (let dataSetId in dataSets) {
      const dataSet = dataSets[dataSetId];
      if (dataSet && dataSet.status == app.DATASET_ENABLED) {
        let dataSetLine = {
          name: dataSet.name,
          si: dataSet.si,
          format: '%(name)s: %(y).5g %(si)s',
          style: {
            stroke: colorGroup[dataSetId % colorGroup.length],
            strokeWidth: 1,
            ...dataSet.style
          },
          points: dataSetValues[dataSet.id].map((dataSetValue) => {
            return {
              x: dataSetValue.time,
              y: !dataSet.badValue || Math.abs(dataSetValue.value) < dataSet.badValue ? dataSetValue.value : null
            };
          })
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
    }

    return Object.values(chartGroups);
  };

  render() {
    const {isLoading, isError, dataSets, dataSetValues} = this.props.data;
    const chartLines = this.prepareDataForChart(dataSets, dataSetValues);
    const isEmpty = !chartLines.length;

    let container = null;

    if (isEmpty) {
      container = (<ChartAlert icon="info-circle" text="No data available" onContextMenu={this.handlerContextMenu}/>);
    }

    if (isError) {
      container = (<ChartAlert icon="exclamation-circle" text={isError.name} description={isError.message}
                          onContextMenu={this.handlerContextMenu}/>);
    }

    if (isLoading) {
      container = (<ChartAlert icon="loading" text="Loading..." onContextMenu={this.handlerContextMenu}/>);
    }

    if (!container) {
      container = (
        <div
          style={{width: this.props.width, height: this.props.height}}
          onContextMenu={this.handlerContextMenu}
          id="dataSetChart"
        >
          <LineChart
            width={this.props.width}
            height={this.props.height}
            data={chartLines}
            tooltipDelay={100}
            tooltipOnClick={this.handlerMouseClick}
            lastRender={new Date()}
            ref="chart"
            antiAliasing={this.props.antiAliasing}
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
    data: state.dataSet,
    antiAliasing: state.main.settings.app.antiAliasing,
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
