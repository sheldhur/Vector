// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import LineChart from './../chart/LineChart';
import {NoDataAlert} from './../widgets/ChartAlert';
import {magnetopausePoint} from '../../lib/geopack';
import './../../utils/helper';


class MagnetopauseMapX extends Component {

  prepareData = (values) => {
    if (!values) {
      return null;
    }

    let magnetopause = new magnetopausePoint(values);

    let breakPoint = false;
    let points = [];
    for (let i = 0; i <= 360; i++) {
      let point = magnetopause.calculate(i, 0).toCartesian();
      if (point.x.between([-50, 30], true)) {
        points.push({
          x: point.x,
          y: point.z
        });
      } else {
        if (!breakPoint) {
          points.push({x: null, y: null});
          breakPoint = true;
        }
      }
    }

    let chartLines = [
      {
        si: 'Z (Re)',
        extent: {x: [-40, 20], y: [-30, 30]},
        lines: [{
          name: 'Magnetopause',
          si: 'Z (Re)',
          style: {
            stroke: '#ff7f0e',
            strokeWidth: 1,
          },
          points: points
        }, {
          name: 'Earth',
          si: 'Z (Re)',
          curve: 'BasisClosed',
          style: {
            stroke: 'silver',
            strokeWidth: 1,
          },
          points: [{x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}]
        }]
      },
    ];

    return chartLines;
  };

  render = () => {
    const {wind} = this.props;
    const data = this.prepareData(wind);

    return (
        <div className="magnetopause-map">
          <LineChart
            width={this.props.width}
            height={this.props.height}
            data={data}
            tooltipDelay={100}
            ticks={{x: 5, y: 5}}
            showTooltip={false}
            showTimeCursor={false}
            labelY={'Z (Re)'}
            antiAliasing={this.props.antiAliasing}
            emptyMessage={<NoDataAlert/>}
          />
        </div>
      );
  };
}

MagnetopauseMapX.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

MagnetopauseMapX.defaultProps = {
  width: '100%',
  height: '100%',
  wind: null
};

export default MagnetopauseMapX;