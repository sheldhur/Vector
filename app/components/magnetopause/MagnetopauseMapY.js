// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NoDataAlert} from './../widgets/ChartAlert';
import LineChart from './../chart/LineChart';
import {magnetopausePoint} from '../../lib/geopack';
import MagnetopauseMapMenu from './MagnetopauseMapMenu';
import './../../utils/helper';


class MagnetopauseMapY extends Component {

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      MagnetopauseMapMenu();
    }
  };

  getDotPosition = function (angle, ringRad) {
    const center = 0;
    const radians = angle * Math.PI / 180.0;
    return [(ringRad * Math.cos(radians) + center), (ringRad * Math.sin(radians) + center)];
  };

  prepareData = (values) => {
    if (!values) {
      return null;
    }

    let magnetopause = new magnetopausePoint(values);

    let tmp = [];

    let lines = [];
    for (let j = 0; j < 180; j = j + 5) {
      let line = {
        name: 'Magnetopause',
        si: 'Z (Re)',
        curve: 'BasisOpen',
        style: {
          stroke: '#ff7f0e',
          strokeWidth: 1,
        },
        points: []
      };
      for (let i = 0; i < 360; i++) {
        let coordinates = this.getDotPosition(i, j);
        let point = magnetopause.calculate(coordinates[0], coordinates[1]).toCartesian();
        if (point.x.between([-10, 10], true)) {
          line.points.push({
            x: point.y,
            y: point.z
          });
        }

        tmp.push([point.x, point.y, point.z]);

        // line.points.push({
        //   x: coordinates[0],
        //   y: coordinates[1]
        // });
      }

      lines.push(line);
    }

    console.log(tmp.map((item) => {
      return '[' + item.toString() + ']'
    }).join('\r\n'));


    let chartLines = [
      {
        si: 'Z (Re)',
        extent: {x: [-30, 30], y: [-30, 30]},
        lines: lines
      },
    ];

    return chartLines;
  };

  render = () => {
    const {wind} = this.props;
    const data = this.prepareData(wind);

    return (
      <div id="magnetopauseMap" className="magnetopause-map" onContextMenu={this.handlerContextMenu}>
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

MagnetopauseMapY.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

MagnetopauseMapY.defaultProps = {
  width: '100%',
  height: '100%',
  wind: null
};

export default MagnetopauseMapY;
