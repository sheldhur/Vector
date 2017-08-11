import moment from 'moment';
import * as fs from 'fs';
import '../../../utils/helper';

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
        rows: []
      };

      let regexp = {
        properties: /\s?(.{0,22})\s+(.+)\|/i,
        comment: /\s?#\s+(.+)\s+\|/,
      };

      let isProperty = true;

      let lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        line = line.trim();
        if (line !== '') {
          if (isProperty) {
            if (!line.startsWith('#')) {
              let matches = line.match(regexp.properties);
              if (matches !== null) {
                let varName = matches[1].trim().toCamelCase();
                data.properties[varName] = matches[2].trim();
                if (varName === 'iagaCode') {
                  data.properties['code'] = data.properties[varName];
                } else if (['geodeticLatitude', 'geodeticLongitude'].indexOf(varName) !== -1) {
                  data.properties[varName] = parseFloat(data.properties[varName]);
                } else if (varName === 'dateTime') {
                  data.columns = data.properties[varName].split(/\s+/).map((item) => {
                    let name = item.trim().replace(data.properties['code'], '');
                    if (item === 'DOY') {
                      name = 'DATETIME';
                    }

                    return {
                      name,
                      description: null,
                      si: null,
                    };
                  })
                }
              }
            } else {
              let matches = line.match(regexp.comment);
              if (matches !== null) {
                if (data.properties['comment'] === undefined) {
                  data.properties['comment'] = '';
                }

                data.properties['comment'] += matches[1].trim() + ' \r\n';
              }
            }
          } else {
            if (!line.startsWith('#')) {
              let lineSplit = line.split(/\s+/);
              lineSplit[0] = lineSplit[0] + ' ' + lineSplit[1];
              lineSplit.remove(1, 2);

              data.rows.push(lineSplit.map((cell, i) => {
                if (i === 0) {
                  cell = moment(cell, "YYYY-MM-DD HH:mm:ss.SSS").toDate();
                } else {
                  cell = parseFloat(cell);
                }

                return cell;
              }));
            }
          }

          if (line.startsWith('DATE')) {
            isProperty = false;
          }
        }
      });

      resolve(data);
    });
  });
}
