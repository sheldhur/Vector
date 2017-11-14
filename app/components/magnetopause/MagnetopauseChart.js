// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import LineChart from './../chart/LineChart';
import TitleCurrentTime from './../main/TitleCurrentTime';
import {NoDataAlert} from './../widgets/ChartAlert';
import MagnetopauseChartMenu from './MagnetopauseChartMenu';
import './../../utils/helper';


class MagnetopauseChart extends Component {

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      const {chart} = this.props;
      MagnetopauseChartMenu({
        data: chart,
        dataNotEmpty: chart != null && chart.length > 0
      });
    }
  };

  prepareDataForChart = (points) => {
    return [{
      si: 'Re',
      lines: [{
        si: 'Re',
        name: 'Magnetopause',
        format: '%(name)s: %(y).5g %(si)s',
        style: {
          stroke: '#ff7f0e',
          strokeWidth: 1,
        },
        points
      }]
    }]
  };

  render() {
    const {chart} = this.props;

    const data = this.prepareDataForChart(chart);
    return (
      <div id="magnetopauseChart" style={{width: this.props.width, height: this.props.height}} onContextMenu={this.handlerContextMenu}>
        <LineChart
          width={this.props.width}
          height={this.props.height}
          data={data}
          tooltipDelay={100}
          antiAliasing={this.props.antiAliasing}
          emptyMessage={<NoDataAlert/>}
        >
          <TitleCurrentTime/>
        </LineChart>
      </div>
    );
  }
}

MagnetopauseChart.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

MagnetopauseChart.defaultProps = {
  width: '100%',
  height: '100%',
};

export default MagnetopauseChart;
