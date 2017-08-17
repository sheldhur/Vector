// @flow
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {remote} from 'electron';
import {Icon} from 'antd';
import moment from 'moment';
import LineChart from './../chart/LineChart';
import StationAvgMenu from './StationAvgMenu';
import * as StationActions from './../../actions/station';
import * as app from './../../constants/app';

class StationAvgChart extends Component {

  componentWillMount = () => {
    // if (!this.props.isLoading) {
    //   this.props.stationActions.getData('getAvgValues');
    // }
  };

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      let {data} = this.props;

      StationAvgMenu({
        dataNotEmpty: !!data,
        stationActions: this.props.stationActions,
        prepareDataForCsv: this.prepareDataForCsv,
      });
    }
  };

  prepareDataForCsv = () => {
    const {data} = this.props;
    const {latitudeRanges, lines} = {...this.props.settings.avgChart};

    let csvData = {
      0: {
        0: 'DateTime'
      }
    };
    latitudeRanges.forEach((range, rangeKey) => {
      lines.forEach((line, lineKey) => {
        let colKey = rangeKey + '-' + lineKey;

        csvData[0][colKey] = line.comp.replace(/^d/, 'Δ') + ' ' + line.hemisphere + ' ' + range.toString();

        let pointsValue = data[line.comp][rangeKey][line.hemisphere];
        for (let time in pointsValue) {
          if (!csvData.hasOwnProperty(time)) {
            csvData[time] = {
              0: moment(parseInt(time)).format(app.FORMAT_DATE_SQL)
            };
          }
          csvData[time][colKey] = pointsValue[time]
        }
      });
    });

    return csvData;
  };

  prepareDataForChart = () => {
    const {data} = this.props;
    const {latitudeRanges, lines} = {...this.props.settings.avgChart};
    const colorGroup = app.DATA_SET_COLOR;

    let chartData = [];

    if (data) {
      latitudeRanges.forEach((range, rangeKey) => {
        let lineHasValues = {};
        let latitudeGroup = {
          si: null,
          lines: []
        };
        lines.forEach((line, lineKey) => {
          let lineData = {
            name: line.comp.replace(/^d/, 'Δ') + ' ' + line.hemisphere,
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
            let pointsValue = data[line.comp][rangeKey][line.hemisphere];
            for (let time in pointsValue) {
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
    const {isLoading, isError} = this.props;
    const {latitudeRanges} = this.props.settings.avgChart;

    const preparedData = this.prepareDataForChart();
    let isEmpty = !preparedData.some((latitudeRange) => {
      return latitudeRange.some((group) => {
        return group.lines.length > 0;
      })
    });

    const Alert = (props) => {
      return (
        <div className="centered-box" onContextMenu={props.onContextMenu}>
          <div>
            <h1><Icon type={props.icon}/></h1>
            <h3>{props.text}</h3>
            <p>{props.description}</p>
          </div>
        </div>
      );
    };

    const AvgDataChart = (props) => {
      // if (props.itemKey !== 0) {
      const condition = props.itemKey !== latitudeRanges.length - 1 ? '≥ gLat >' : '≥ gLat ≥';
      const chartTitle = `${latitudeRanges[props.itemKey][0]}° ${condition} ${latitudeRanges[props.itemKey][1]}°`;
      // }

      let isHasValues = false;
      props.data.forEach((item) => {
        if (item.lines.length) {
          isHasValues = true;
        }
      });

      if (isHasValues) {
        return (
          <div key={props.itemKey} style={props.style} onContextMenu={this.handlerContextMenu}>
            <LineChart
              width={'100%'}
              height={'100%'}
              data={props.data}
              tooltipDelay={100}
              lastRender={new Date()}
              antiAliasing={this.props.antiAliasing}
            >
              {/*H<sub>av</sub> */}
              {chartTitle}
            </LineChart>
          </div>
        );
      } else {
        return (
          <div key={props.itemKey} style={props.style} onContextMenu={this.handlerContextMenu}>
            <Alert icon="info-circle" text="No data available"/>
          </div>
        );
      }
    };

    let container = null;

    if (isEmpty) {
      container = (<Alert icon="info-circle" text="No data available" onContextMenu={this.handlerContextMenu}/>);
    }

    if (isError) {
      container = (<Alert
        icon="exclamation-circle"
        text={isError.name}
        description={isError.message}
        onContextMenu={this.handlerContextMenu}
      />);
    }

    if (isLoading) {
      container = (<Alert icon="loading" text="Loading..." onContextMenu={this.handlerContextMenu}/>);
    }

    if (!container) {
      let chartStyle = {
        height: (100 / latitudeRanges.length) + '%'
      };

      container = (
        <div style={{height: "100%", width: '100%'}} id="stationAvgChar">
          {latitudeRanges.map((item, i) => {
            return <AvgDataChart key={i} itemKey={i} style={chartStyle} data={preparedData[i] || []}/>;
          })}
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
    settings: state.main.settings.project,
    latitudeRanges: state.main.settings.project.avgChart.latitudeRanges,
    lines: state.main.settings.project.avgChart.lines,
    antiAliasing: state.main.settings.app.antiAliasing,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    stationActions: bindActionCreators(StationActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StationAvgChart);
