// @flow
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ProgressAlert, NoDataAlert } from '../widgets/ChartAlert';
import moment from 'moment';
import LineChart from '../chart/LineChart';
import StationAvgMenu from './StationAvgMenu';
import * as stationActions from '../../actions/station';
import * as app from '../../constants/app';

class StationAvgChart extends Component {
  componentWillMount = () => {
    // if (!this.props.isLoading) {
    //   this.props.stationActions.getData('getAvgValues');
    // }
  };

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      const { data } = this.props;

      StationAvgMenu({
        dataNotEmpty: !!data,
        stationActions: this.props.stationActions,
        prepareDataForCsv: this.prepareDataForCsv,
      });
    }
  };

  handlerMouseClick = (e) => {
    this.props.stationActions.getStationsValue();
  };

  prepareDataForCsv = () => {
    const { data, latitudeRanges, componentLines } = this.props;

    const csvData = {
      0: {
        0: 'DateTime'
      }
    };

    const linesEnabled = componentLines.filter((line) => line.enabled);

    latitudeRanges.forEach((range, rangeKey) => {
      linesEnabled.forEach((line, lineKey) => {
        const colKey = `${rangeKey}-${lineKey}`;

        csvData[0][colKey] = `${line.comp.replace(/^d/, 'Δ')} ${line.hemisphere} ${range.toString()}`;

        const pointsValue = data[line.comp][rangeKey][line.hemisphere];
        for (const time in pointsValue) {
          if (!csvData.hasOwnProperty(time)) {
            csvData[time] = {
              0: moment(parseInt(time)).format(app.FORMAT_DATE_SQL)
            };
          }
          csvData[time][colKey] = pointsValue[time] ? pointsValue[time].toFixed(5).replace('.', ',') : null;
        }
      });
    });

    return csvData;
  };

  prepareDataForChart = () => {
    const { data, latitudeRanges, componentLines } = this.props;
    const colorGroup = app.DATA_SET_COLOR;

    const chartData = [];

    if (data) {
      latitudeRanges.forEach((range, rangeKey) => {
        const lineHasValues = {};
        const latitudeGroup = {
          si: null,
          lines: []
        };
        componentLines.forEach((line, lineKey) => {
          const lineData = {
            name: `${line.comp.replace(/^d/, 'Δ')} ${line.hemisphere}`,
            format: '%(name)s: %(y).2f nT',
            style: {
              stroke: colorGroup[lineKey % colorGroup.length],
              strokeWidth: 1,
              ...line.style
            },
            points: []
          };

          if (lineHasValues[lineKey] === undefined) {
            lineHasValues[lineKey] = data[line.comp] !== undefined && data[line.comp][rangeKey] !== undefined && data[line.comp][rangeKey][line.hemisphere] !== undefined;
          }

          if (lineHasValues[lineKey]) {
            const pointsValue = data[line.comp][rangeKey][line.hemisphere];
            for (const time in pointsValue) {
              lineData.points.push({
                x: new Date(parseInt(time)),
                y: pointsValue[time],
              });
            }
          }

          if (lineData.points.length > 0) {
            latitudeGroup.lines.push(lineData);
          }
        });

        chartData.push([latitudeGroup]);
      });
    }

    return chartData;
  };

  render = () => {
    const {
      isLoading, isError, progress, latitudeRanges
    } = this.props;

    const preparedData = this.prepareDataForChart();
    const isEmpty = !preparedData.some((latitudeRange) => latitudeRange.some((group) => group.lines.length > 0));

    const AvgDataChart = (props) => {
      const condition = props.itemKey !== latitudeRanges.length - 1 ? '≥ gLat >' : '≥ gLat ≥';
      const chartTitle = `${latitudeRanges[props.itemKey][0]}° ${condition} ${latitudeRanges[props.itemKey][1]}°`;

      return (
        <div key={props.itemKey} style={props.style} onContextMenu={this.handlerContextMenu}>
          <LineChart
            width="100%"
            height="100%"
            data={props.data}
            tooltipDelay={100}
            tooltipOnClick={this.handlerMouseClick}
            antiAliasing={this.props.antiAliasing}
            emptyMessage={<NoDataAlert />}
          >
            {chartTitle}
          </LineChart>
        </div>
      );
    };

    let container = null;

    if (isEmpty) {
      container = (<NoDataAlert onContextMenu={this.handlerContextMenu} />);
    }

    if (isLoading || isError) {
      container = (<ProgressAlert
        text={progress.title}
        percent={progress.value}
        error={isError}
        onContextMenu={this.handlerContextMenu}
      />);
    }

    if (!container) {
      const chartStyle = {
        height: `${100 / latitudeRanges.length}%`
      };

      container = (
        <div style={{ height: '100%', width: '100%' }} id="stationAvgChar">
          {latitudeRanges.map((item, i) => <AvgDataChart key={i} itemKey={i} style={chartStyle} data={preparedData[i] || []} />)}
        </div>
      );
    }

    return container;
  };
}

StationAvgChart.defaultProps = {};

function mapStateToProps(state) {
  return {
    data: state.station.latitudeAvgValues,
    isLoading: state.station.isLoading,
    isError: state.station.isError,
    progress: state.station.progress,
    settings: state.main.settings.project,
    latitudeRanges: state.main.settings.projectAvgLatitudeRanges,
    componentLines: state.main.settings.projectAvgComponentLines,
    antiAliasing: state.main.settings.appAntiAliasing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationActions: bindActionCreators(stationActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationAvgChart);
