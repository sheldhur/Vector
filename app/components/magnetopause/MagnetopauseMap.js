// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import MagnetopauseMapX from './MagnetopauseMapX';


class MagnetopauseMap extends Component {
  state = {
    wrapperSize: {
      width: undefined,
      height: undefined
    }
  };

  componentDidMount = () => {
    if (this.props.width === '100%' || this.props.height === '100%') {
      window.addEventListener('resize', this.handleResize);
    }

    setTimeout(() => {
      this.handleResize();
    }, 100);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleResize);
  };

  handleResize = (e) => {
    let svgWrapper = ReactDOM.findDOMNode(this.refs.svgWrapper);

    this.setState({
      wrapperSize: {
        width: svgWrapper.offsetWidth,
        height: svgWrapper.offsetHeight
      }
    });
  };

  getSize = () => {
    const {height, width} = this.state.wrapperSize;

    let size = {
      width: undefined,
      height: undefined
    };

    if (height !== undefined && width !== undefined) {
      size.width = height * 2;
      size.height = height;
      if (width < size.width) {
        size.width = width;
        size.height = width / 2;
      }
    }

    return size;
  };

  render = () => {
    const size = this.getSize();
    const {data, currentTime} = this.props;

    if (data && size.width !== undefined) {
      const currentTimeData = data.hasOwnProperty(currentTime) || currentTime === null ? data[currentTime] : null;

      return <div className="svg-wrapper centered-box" ref="svgWrapper" style={{padding: 5}}>
        <MagnetopauseMapX
          width={size.width / 2}
          height={size.height- 10}
          wind={currentTimeData}
          antiAliasing={this.props.antiAliasing}
        />
        {/*<MagnetopauseMapY*/}
          {/*width={size.width / 2}*/}
          {/*height={size.height}*/}
          {/*wind={currentData}*/}
          {/*antiAliasing={this.props.antiAliasing}*/}
        {/*/>*/}
      </div>;
    }

    return <div className="svg-wrapper center" ref="svgWrapper"></div>
  };
}

MagnetopauseMapX.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

MagnetopauseMap.defaultProps = {
  width: '100%',
  height: '100%',
};

function mapStateToProps(state) {
  return {
    data: state.magnetopause.data,
    currentTime: state.chart.chartCurrentTime ? state.chart.chartCurrentTime : null,
    antiAliasing: state.main.settings.appAntiAliasing,
  };
}

export default connect(mapStateToProps)(MagnetopauseMap);
