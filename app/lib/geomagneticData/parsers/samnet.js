import moment from 'moment';
import * as fs from 'fs';

export default function (filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, (error, rawData) => {
      if (error) {
        throw error;
      }

      let data = {
        properties: {
          badValue: 99999
        },
        columns: [],
        rows: [],
      };

      let regexp = {
        properties: /^([^:]+):(.+)?/i,
      };

      let isProperty = true;
      let rowCount = 0;

      let lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        line = line.trim();
        if (line === '' && isProperty) {
          isProperty = false;
        } else if (line !== '') {
          if (isProperty) {
            let matches = line.match(regexp.properties);
            if (matches !== null) {
              let varName = matches[1].trim().toCamelCase();
              data.properties[varName] = matches[2] ? matches[2].trim() : null;
              if (['startTime', 'endTime'].indexOf(varName) !== -1) {
                data.properties[varName] = moment(data.properties[varName], 'YYYY-MM-DD HH:mm:ss').toDate();
              } else if (varName === 'location') {
                let tmp = data.properties[varName].match(/\((.+),(.+)\)/i);
                if (tmp !== null) {
                  let lat = tmp[1].split(/\s+deg\s+/i);
                  let long = tmp[2].split(/\s+deg\s+/i);

                  lat[0] = parseFloat(lat[0]);
                  long[0] = parseFloat(long[0]);
                  lat[1] = lat[1].toUpperCase();
                  long[1] = long[1].toUpperCase();

                  data.properties.geodeticLatitude = lat[1] === 'S' && lat[0] > 0 ? -1 * lat[0] : lat[0];
                  // data.properties.geodeticLongitude = long[1] === 'W' && long[0] > 0 ? 360 - long[0] : long[0];
                  data.properties.geodeticLongitude = long[1] === 'W' && long[0] > 0 ? -1 * long[0] : long[0];
                } else {
                  data.properties.geodeticLatitude = null;
                  data.properties.geodeticLongitude = null;
                }
              } else if (varName === 'components') {
                data.properties[varName] = data.properties[varName].match(/\w/ig);
              } else if (varName === 'abbreviation') {
                data.properties['code'] = data.properties[varName].toUpperCase();
              } else if (varName === 'resolution') {
                let resolution = data.properties[varName].split(/\s+/);
                resolution[0] = parseFloat(resolution[0]);

                data.properties[varName] = resolution[1].toUpperCase() === 'S' ? resolution[0] : resolution[1] * 60;
              }
            }
          } else {
            let lineSplit = line.split(/\s+/);
            let row = [];
            row.push(new Date(data.properties.startTime.valueOf() + (rowCount * data.properties.resolution * 1000)));
            for (let i = 0; i < 3; i++) {
              if (lineSplit[i] !== undefined) {
                row.push(parseFloat(lineSplit[i]));
              } else {
                row.push(null);
              }
            }

            data.rows.push(row);
            rowCount++;
          }
        }
      });

      if (data.properties.components.indexOf('Z')) {
        data.properties.components.push('Z');
      }

      data.columns = ['DATETIME', ...data.properties.components].map((item) => {
        return {
          name: item,
          description: null,
          si: null,
        }
      });
      data.properties.reported = data.properties.components.join('');

      resolve(data);
    });
  });
}
