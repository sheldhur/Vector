// @flow
import React, { Component } from 'react';


//TODO: зависит от даты, прикрутить модели IGRF и WWM https://upload.wikimedia.org/wikipedia/commons/d/de/World_Magnetic_Inclination_2015.pdf
//TODO: https://github.com/naturalatlas/geomagnetism
class GeomagEquator extends Component {
  render() {
    let inclinationValues = [11.50, 11.50, 11.50, 11.00, 11.00, 10.50, 10.50, 10.00, 9.50, 9.00, 8.50, 8.00, 7.50, 7.50, 7.00, 7.50, 7.50, 7.50, 7.50, 8.00, 8.00, 8.00, 8.00, 8.50, 8.00, 8.00, 8.00, 8.00, 7.50, 7.50, 7.50, 7.50, 7.50, 8.00, 8.00, 8.00, 7.50, 7.50, 7.00, 6.50, 6.00, 5.50, 4.50, 4.00, 3.00, 2.50, 1.50, 1.00, 0.50, 0.00, -0.50, -0.50, -1.00, -1.50, -2.00, -2.50, -3.00, -3.50, -4.00, -4.00, -4.50, -5.50, -6.00, -6.50, -7.50, -8.50, -9.00, -10.00, -11.00, -11.50, -12.00, -12.50, -12.50, -12.00, -11.00, -9.50, -7.50, -5.00, -2.50, 0.00, 2.50, 5.00, 7.00, 8.50, 9.50, 10.50, 11.00, 11.50, 11.50, 11.50, 11.50,];

    let line = {
      type: 'LineString',
      coordinates: inclinationValues.map((item, i) => {
        return [i * 4, item];
      }),
    };

    return (
      <path d={this.props.path(line)} stroke="black" strokeWidth={1} strokeDasharray={'4,2'} strokeOpacity={0.8}
            fill="none" />
    );
  }
}

export default GeomagEquator
