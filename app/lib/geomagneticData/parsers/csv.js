import moment from 'moment';
import csv from 'csv-string';
import * as fs from 'fs';

export default function (filePath, callback) {
  return new Promise((resolve) => {
    fs.readFile(filePath, (error, rawData) => {
      if (error) {
        throw error;
      }

      let data = {
        properties: null,
        columns: [],
        rows: [],
      };

      if (callback === undefined || typeof callback !== 'function') {
        callback = (item, i) => {
          if (i === 0) {
            item = moment(item, "YYYY-MM-DD HH:mm:ss.SSS").toDate();
          } else {
            item = parseFloat(item.replace(',', '.'));
          }

          return item
        }
      }

      csv.forEach(rawData.toString(), ';', (row, i) => {
        if (row.length > 0 && row[0] !== '') {
          if (i === 0) {
            row.forEach((item, i) => {
              data.columns.push({
                name: item,
              });
            });
          } else {
            data.rows.push(row.map((item, i) => callback(item, i)));
          }
        }
      });

      resolve(data);
    });
  });
};
