import moment from 'moment';
import * as fs from 'fs';

const stationList = {
  NAL: { glon: 11.95, glat: 78.92 },
  LYR: { glon: 15.82, glat: 78.20 },
  HOR: { glon: 15.55, glat: 77.00 },
  HOP: { glon: 25.01, glat: 76.51 },
  BJN: { glon: 19.20, glat: 74.50 },
  TRO: { glon: 18.96, glat: 69.66 },
  AND: { glon: 16.03, glat: 69.29 },
  ABK: { glon: 18.82, glat: 68.35 },
  KIR: { glon: 20.42, glat: 67.84 },
  LOZ: { glon: 35.08, glat: 67.97 },
  SOR: { glon: 22.22, glat: 70.54 },
  MAS: { glon: 23.70, glat: 69.46 },
  KEV: { glon: 27.01, glat: 69.76 },
  KIL: { glon: 20.70, glat: 69.05 },
  MUO: { glon: 23.53, glat: 68.02 },
  PEL: { glon: 24.08, glat: 66.90 },
  SOD: { glon: 26.63, glat: 67.37 },
  LYC: { glon: 18.75, glat: 64.61 },
  OUJ: { glon: 27.23, glat: 64.52 },
  HAN: { glon: 26.65, glat: 62.30 },
  NUR: { glon: 24.65, glat: 60.50 },
  UPS: { glon: 17.35, glat: 59.90 },
};


export default function (filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, (error, rawData) => {
      if (error) {
        throw error;
      }

      let data = {};

      const regexp = {
        data: /^(.{22})(.+)/,
        values: /.{8}/g
      };

      let isProperty = true;

      const lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        line = line.trim();
        if (line !== '') {
          if (isProperty) {
            if (line.startsWith('-----')) {
              isProperty = false;
              data = Object.values(data);
            } else {
              const lineSplit = line.match(regexp.data);
              if (lineSplit.length === 3) {
                lineSplit[2].match(regexp.values).forEach((value) => {
                  const stationName = value.trim().split(/\s+/)[0];
                  if (!data.hasOwnProperty(stationName)) {
                    const reported = 'XYZ';
                    const columns = reported.split('');

                    data[stationName] = {
                      properties: {
                        code: stationName,
                        geodeticLatitude: stationList[stationName].glat,
                        geodeticLongitude: stationList[stationName].glon,
                        reported,
                        badValue: 99999
                      },
                      columns: ['DATETIME', ...columns].map((item) => ({
                        name: item,
                        description: null,
                        si: null,
                      })),
                      rows: [],
                    };
                  }
                });
              }
            }
          } else {
            const lineSplit = line.match(regexp.data);
            if (lineSplit.length === 3) {
              const date = moment(lineSplit[1].trim(), 'YYYY MM DD HH mm ss').toDate();
              const values = lineSplit[2].match(regexp.values);
              data.forEach((station) => {
                const stationValues = values.splice(0, 3).map((item) => parseFloat(item));
                station.rows.push([date, ...stationValues]);
              });
            }
          }
        }
      });

      resolve(data);
    });
  });
}
