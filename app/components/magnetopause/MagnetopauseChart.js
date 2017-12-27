// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import LineChart from '../chart/LineChart';
import TitleCurrentTime from '../main/TitleCurrentTime';
import { NoDataAlert } from '../widgets/ChartAlert';
import MagnetopauseChartMenu from './MagnetopauseChartMenu';
import * as prepareData from '../../utils/prepareData';


class MagnetopauseChart extends Component {
  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      const { chart } = this.props;
      MagnetopauseChartMenu({
        data: chart,
        dataNotEmpty: chart != null && chart.length > 0
      });
    }
  };

  render = () => {
    const dataSets = {};
    const dataSetValues = {};

    this.props.magnetopauseDataSets.forEach((id) => {
      if (this.props.dataSets.hasOwnProperty(id)) {
        dataSets[id] = this.props.dataSets[id];
        dataSetValues[id] = this.props.dataSetValues[id];
      }
    });

    dataSets.magnetopause = {
      id: 'magnetopause',
      axisGroup: 0,
      name: 'Magnetopause',
      si: 'Re',
      style: { stroke: '#ff7f0e' },
      axisY: -1,
      badValue: null,
      status: 1
    };
    dataSetValues.magnetopause = this.props.chart;

    const chartLines = prepareData.dataSetsForChart(dataSets, dataSetValues);
    return (
      <div
        id="magnetopauseChart"
        style={{ width: this.props.width, height: this.props.height }}
        onContextMenu={this.handlerContextMenu}
      >
        <LineChart
          width={this.props.width}
          height={this.props.height}
          data={chartLines}
          tooltipDelay={100}
          antiAliasing={this.props.antiAliasing}
          emptyMessage={<NoDataAlert />}
        >
          <TitleCurrentTime />
        </LineChart>
      </div>
    );
  };
}

MagnetopauseChart.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

MagnetopauseChart.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    chart: state.magnetopause.chart,
    magnetopauseDataSets: state.main.settings.projectMagnetopauseDataSets,
    dataSets: state.dataSet.dataSets,
    dataSetValues: state.dataSet.dataSetValues,
    antiAliasing: state.main.settings.appAntiAliasing,
  };
}

export default connect(mapStateToProps, null)(MagnetopauseChart);
