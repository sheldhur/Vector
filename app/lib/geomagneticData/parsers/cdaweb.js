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
        properties: {},
        variables: {},
        columns: [],
        rows: []
      };

      let regexp = {
        properties: /#\s{5}([A-Z0-9_-]+)\s+(.+)/,
        variables: /#\s+(\d+)\.\s+(.+)/,
        n: /#\s+(.+)/
      };

      let resultLastPropName;
      let lastVarName;

      let lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        if (line !== '') {
          if (line.startsWith('#')) {
            if (line === '#') {
              resultLastPropName = undefined;
              lastVarName = undefined;
            }

            for (let key in regexp) {
              let matches = line.match(regexp[key]);
              if (matches !== null) {
                if (data[key] !== undefined) {
                  resultLastPropName = key;
                  lastVarName = matches[1].trim().toCamelCase();
                  data[resultLastPropName][lastVarName] = matches[2].trim();
                } else if (resultLastPropName !== undefined) {
                  data[resultLastPropName][lastVarName] += "\r\n" + matches[1].trim();
                }

                break;
              }
            }
          } else {
            let lineSplit = line.split(/\s+/);
            if (['UT','EPOCH_TIME','EPOCH','TIME','DATE'].indexOf(lineSplit[0]) !== -1) {
              lineSplit.forEach((item, i) => {
                data.columns.push({
                  name: item,
                  description: data.variables[++i],
                  si: null,
                });
              });
            } else {
              lineSplit[0] = lineSplit[0] + ' ' + lineSplit[1];
              lineSplit.remove(1);
              if (lineSplit[0].search(/^\d/) === -1) {
                lineSplit.forEach((item, i) => {
                  data.columns[i]['si'] = item;
                });
              } else {
                data.rows.push(lineSplit.map((item, i) => {
                  if (i === 0) {
                    item = moment(item, "DD-MM-YYYY HH:mm:ss.SSS").toDate();
                  } else {
                    item = parseFloat(item);
                  }

                  return item;
                }));
              }
            }
          }
        }
      });

      resolve(data);
    });
  });
}
