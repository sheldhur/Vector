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
          reported: 'XYZ',
          badValue: 99999
        },
        columns: [],
        rows: [],
      };

      let regexp = {
        properties: /\s+/i,
        components: /-?\d+\.\d{3}/ig
      };

      let isProperty = true;

      let lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        line = line.trim();
        if (line !== '') {
          if (!line.startsWith('#')) {
            if (isProperty) {
              let lineSplit = line.split(regexp.properties);
              data.properties.code = lineSplit[0];
              data.properties.geodeticLatitude = parseFloat(lineSplit[1]);
              data.properties.geodeticLongitude = parseFloat(lineSplit[2]);
              data.columns = ['DATETIME', 'X', 'Y', 'Z'].map((item) => {
                return {
                  name: item,
                  description: null,
                  si: null,
                }
              });
              isProperty = false;
            } else {
              let lineSplitDate = line.substring(0, 14);
              let lineSplitComp = line.substring(15, line.length).match(regexp.components);

              let row = [];
              row.push(moment(lineSplitDate, "YYYYMMDDHHmmss").toDate());
              lineSplitComp.forEach((item, i) => {
                row.push(parseFloat(item));
              });

              data.rows.push(row);
            }
          }
        }
      });

      resolve(data);
    });
  });
}
