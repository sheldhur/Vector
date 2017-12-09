// @flow
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import MapCylindrical from './mapChart/MapCylindrical';
import MapAzimuthal from './mapChart/MapAzimuthal';


//TODO: переделать
class MapChart extends Component {
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
    }, 5);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleResize);
  };

  handleResize = (e) => {
    let svgWrapper = ReactDOM.findDOMNode(this.refs.svgMapWrapper);

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
    const {data, showCountries, projectionType, world} = this.props;

    if (size.width !== undefined) {
      if (projectionType === 'stereographic') {
        return <div className="svg-wrapper centered-box" ref="svgMapWrapper">
          <MapAzimuthal
            width={size.width / 2}
            height={size.height}
            dataFilter={(item) => item.latitude <= 0}
            rotate={[0, 90, 0]}
            data={data}
            terminator={this.props.terminator}
            world={world}
            antiAliasing={this.props.antiAliasing}
          />
          <MapAzimuthal
            width={size.width / 2}
            height={size.height}
            dataFilter={(item) => item.latitude >= 0}
            rotate={[0, -90, 180]}
            data={data}
            terminator={this.props.terminator}
            world={world}
            antiAliasing={this.props.antiAliasing}
          />
        </div>;
      } else if (projectionType === 'equirectangular') {
        return <div className="svg-wrapper centered-box" ref="svgMapWrapper">
          <MapCylindrical
            width={size.width}
            height={size.height}
            data={data}
            terminator={this.props.terminator}
            world={world}
            antiAliasing={this.props.antiAliasing}
          />
        </div>;
      }
    }

    return <div className="svg-wrapper center" ref="svgMapWrapper"></div>
  };
}

MapChart.defaultProps = {
  width: '100%',
  height: '100%',
  projectionType: 'stereographic', //equirectangular stereographic
  world: {},
  terminator: null,
  antiAliasing: true,
};

export default MapChart;
