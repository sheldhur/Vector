// @flow
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {remote} from 'electron';
import {Icon} from 'antd';
import LineChart from './../chart/LineChart';
import TitleCurrentTime from './../main/TitleCurrentTime';
import DataSetChartMenu from './DataSetChartMenu';
import * as MainActions from './../../actions/main';
import * as DataSetActions from './../../actions/dataSet';
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

    let container = null;

    if (isEmpty) {
      container = (<Alert icon="info-circle" text="No data available" onContextMenu={this.handlerContextMenu}/>);
    }

    if (isError) {
      container = (<Alert icon="exclamation-circle" text={isError.name} description={isError.message}
                          onContextMenu={this.handlerContextMenu}/>);
    }

    if (isLoading) {
      container = (<Alert icon="loading" text="Loading..." onContextMenu={this.handlerContextMenu}/>);
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
  width: PropTypes.string || PropTypes.number,
  height: PropTypes.string || PropTypes.number,
};

DataSetChart.defaultProps = {
  width: '100%',
  height: '100%',
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
    dataSetActions: bindActionCreators(DataSetActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataSetChart);
