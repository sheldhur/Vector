// @flow
import React, { Component } from 'react';
import * as fs from 'fs';
import * as topojson from 'topojson';
import resourcePath from '../../../lib/resourcePath';


class World extends Component {
  loadWorldData = (scale) => {
    const files = {
      '1:50': 'world-50m.v1.json',
      '1:110': 'world-110m.v1.json',
    };

    fs.readFile(resourcePath(`./assets/json/${files[scale]}`), 'utf-8', (error, data) => {
      if (error) {
        throw error;
      }

      this.setState({ worldData: JSON.parse(data) }, () => {
        this.prepareWorldMap(this.props);
      });
    });
  };
  prepareWorldMap = (props) => {
    const { worldData } = this.state;
    const { path, ocean } = props;

    if (worldData.objects) {
      this.setState({
        world: {
          ocean: path(ocean),
          land: path(topojson.feature(worldData, worldData.objects.land)),
          country: path(topojson.mesh(worldData, worldData.objects.countries, (a, b) => a !== b)),
        }
      });
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      worldData: undefined,
      world: undefined
    };
  }

  componentDidMount() {
    this.loadWorldData(this.props.scale);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scale !== this.props.scale) {
      this.loadWorldData(nextProps.scale);
    } else if (nextProps.size.width !== this.props.size.width || nextProps.size.height !== this.props.size.height) {
      this.prepareWorldMap(nextProps);
    }
  }

  render() {
    const { countries } = this.props;
    const { world } = this.state;

    const color = {
      water: '#a4bac7',
      land: '#d7c7ad',
      border: '#766951',
      ...this.props.color
    };

    if (world) {
      return (
        <g className="map-world">
          <path className="map-ocean" d={world.ocean} style={{ fill: color.water }} />
          <path className="map-land" d={world.land} style={{ fill: color.land, stroke: color.border }} />
          {countries && <path className="map-country" d={world.country} style={{ stroke: color.border }} />}
        </g>
      );
    }

    return (
      <g className="map-world">
        <path className="map-ocean" d={this.props.path(this.props.ocean)} style={{ fill: color.water }} />
      </g>
    );
  }
}

World.defaultProps = {
  scale: '1:110',
  countries: false,
  color: {},
};

export default World;
