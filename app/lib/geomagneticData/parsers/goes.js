import moment from 'moment';
import * as fs from 'fs';
import { stringCamelCase } from '../../../utils/helper';

export default function (filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, (error, rawData) => {
      if (error) {
        throw error;
      }

      const data = {
        properties: {
          badValue: 99999
        },
        columns: [],
        rows: [],
        satelliteColumns: [],
        satelliteRows: [],
      };

      const variables = {};

      const regexp = {
        variables: /(.+):(.+)\s+=\s+"(.+)"\s*;/,
        properties: /:(.+)\s+=\s+"(.+)"/,
      };

      const IS_VARIABLES = 'variables:';
      const IS_PROPERTY = '// global attributes';
      const IS_SATELLITE_DATA = 'satellite location:';
      const IS_DATA = 'data:';

      let dataBlock = null;
      const dataBlockKey = [
        IS_VARIABLES,
        IS_PROPERTY,
        IS_SATELLITE_DATA,
        IS_DATA
      ];

      const lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        line = line.trim();
        if (line !== '' && !line.startsWith('#')) {
          if (dataBlockKey.indexOf(line) !== -1) {
            dataBlock = line;
          } else if (dataBlock === IS_VARIABLES) {
            const matches = line.match(regexp.variables);
            if (matches !== null) {
              if (!variables.hasOwnProperty(matches[1])) {
                variables[matches[1]] = { name: matches[1] };
              }

              if (['nominal_min', 'nominal_max', 'missing_value'].indexOf(matches[2]) !== -1) {
                matches[3] = parseFloat(matches[3]);
              } else if (matches[2] === 'units') {
                variables[matches[1]].si = matches[3];
              }

              variables[matches[1]][stringCamelCase(matches[2])] = matches[3];
            }
          } else if (dataBlock === IS_PROPERTY) {
            const matches = line.match(regexp.properties);
            if (matches !== null) {
              data.properties[stringCamelCase(matches[1])] = matches[2];
            }
          } else if (dataBlock === IS_SATELLITE_DATA || dataBlock === IS_DATA) {
            const columns = dataBlock === IS_SATELLITE_DATA ? 'satelliteColumns' : 'columns';
            const rows = dataBlock === IS_SATELLITE_DATA ? 'satelliteRows' : 'rows';

            const lineSplit = line.split(',');

            if (data[columns].length === 0) {
              data[columns] = lineSplit.map((cell) => variables[cell]);
            } else {
              data[rows].push(lineSplit.map((cell, i) => {
                if (i === 0) {
                  cell = moment(cell, 'YYYY-MM-DD HH:mm:ss.SSS').toDate();
                } else {
                  cell = parseFloat(cell);
                }

                return cell;
              }));
            }
          }
        }
      });

      resolve(data);
    });
  });
}
