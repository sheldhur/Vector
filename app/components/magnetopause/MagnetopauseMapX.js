// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LineChart from '../chart/LineChart';
import { NoDataAlert } from '../widgets/ChartAlert';
import MagnetopauseMapMenu from './MagnetopauseMapMenu';
import { magnetopausePoint } from '../../lib/geopack';
import { numberIsBetween } from '../../utils/helper';


class MagnetopauseMapX extends Component {
  state = {
    range: 40
  };

  handlerContextMenu = (e) => {
    if (!e.ctrlKey) {
      e.preventDefault();

      MagnetopauseMapMenu({
        state: this.state,
        setState: (state) => this.setState(state),
      });
    }
  };

  prepareData = (values) => {
    if (!values) {
      return null;
    }

    const magnetopause = new magnetopausePoint(values);

    let breakPoint = false;
    const points = [];
    for (let i = 0; i <= 360; i++) {
      let point = magnetopause.calculate(i, 0);
      if (point) {
        point = point.toCartesian();
        if (numberIsBetween(point.x, [-50, 30])) {
          points.push({
            x: point.x,
            y: point.z
          });
        } else if (!breakPoint) {
          points.push({ x: null, y: null });
          breakPoint = true;
        }
      }
    }

    if (points.length) {
      const { range } = this.state;
      const chartLines = [
        {
          si: 'Z (Re)',
          extent: { x: [-range + 15, 15], y: [-(range / 2), range / 2] },
          lines: [{
            name: 'Magnetopause',
            si: 'Z (Re)',
            style: {
              stroke: '#ff7f0e',
              strokeWidth: 1,
            },
            points
          }, {
            name: 'Earth',
            si: 'Z (Re)',
            curve: 'BasisClosed',
            style: {
              stroke: 'silver',
              strokeWidth: 1,
            },
            points: [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }]
          }]
        },
      ];

      return chartLines;
    }

    return null;
  };

  render = () => {
    const { wind } = this.props;
    const data = this.prepareData(wind);

    return (
      <div id="magnetopauseMap" className="magnetopause-map" onContextMenu={this.handlerContextMenu}>
        <LineChart
          width={this.props.width}
          height={this.props.height}
          data={data}
          tooltipDelay={100}
          ticks={{ x: 5, y: 5 }}
          showTooltip={false}
          showTimeCursor={false}
          labelY="X (Re)"
          antiAliasing={this.props.antiAliasing}
          emptyMessage={<NoDataAlert />}
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
