import * as fs from 'fs';
import { Parser } from 'binary-parser';
import { numberIsBetween } from '../../../utils/helper';

const stationList = {
  ARS: { glon: 58.57, glat: 56.43 },
  CCS: { glon: 104.28, glat: 77.72 },
  CKA: { glon: 73.60, glat: 68.50 },
  CPS: { glon: 180.52, glat: 68.92 },
  DIK: { glon: 80.56, glat: 73.54 },
  HIS: { glon: 58.05, glat: 80.62 },
  IRT: { glon: 104.45, glat: 52.17 },
  LOP: { glon: 33.08, glat: 68.25 },
  LOZ: { glon: 35.02, glat: 67.97 },
  MIR: { glon: 93.02, glat: -66.55 },
  MSK: { glon: 37.31, glat: 55.48 },
  MOS: { glon: 37.31, glat: 55.48 },
  SEY: { glon: 72.50, glat: 70.10 },
  TIK: { glon: 129.00, glat: 71.58 },
  VOS: { glon: 106.87, glat: -78.45 },
};

const NO_DATA = 0x7FFF;

export default function (filePath) {
  return new Promise((resolve) => {
    fs.readFile(filePath, (error, rawData) => {
      if (error) {
        throw error;
      }

      const data = {
        properties: {
          badValue: NO_DATA
        },
        columns: [],
        rows: [],
      };

      let isProperty = true;

      const binaryParser = new Parser()
        .int16le('nr')
        .string('stcod', { length: 3 })
        .skip(1)
        .string('cmp', { length: 3 })
        .skip(1)
        .int8('sc')
        .int8('sd')
        .int8('bl')
        .skip(5)
        .int16le('fb')
        .int16le('si')
        .int16le('ds')
        .int16le('gnpd')
        .int16le('glon')
        .int16le('yy')
        .int16le('mm')
        .int16le('dd')
        .int16le('hh')
        .int16le('mn')
        .int16le('mv1')
        .int16le('mv2')
        .int16le('mv3')
        .int32le('bs1')
        .int32le('bs2')
        .int32le('bs3')
        .array('v1', {
          type: 'int16le',
          length: 60
        })
        .array('v2', {
          type: 'int16le',
          length: 60
        })
        .array('v3', {
          type: 'int16le',
          length: 60
        })
        .buffer('dbg', { readUntil: 'eof' });

      let position = 0;
      const bufferSize = 416;
      while (position < rawData.length) {
        const buffer = rawData.slice(position, Math.min(position + bufferSize, rawData.length));
        position += bufferSize;

        const line = binaryParser.parse(buffer);

        line.stcod = line.stcod.toUpperCase();
        if (line.glon === NO_DATA || line.gnpd === NO_DATA || line.glon === 0 || line.gnpd === 0) {
          const stationCoord = stationList[line.stcod];
          line.glon = stationCoord.glon;
          line.glat = stationCoord.glat;
          line.gnpd = 90 - stationCoord.glat;
        } else {
          line.glon *= 0.01;
          line.gnpd *= 0.01;
          line.glat = 90 - line.gnpd;
        }

        ['glon', 'gnpd', 'glat'].forEach((key) => {
          line[key] = Number(line[key].toFixed(2));
        });

        if (isProperty) {
          data.properties.code = line.stcod;
          data.properties.geodeticLatitude = line.glat;
          data.properties.geodeticLongitude = line.glon;
          data.properties.reported = line.cmp.toUpperCase();

          const columns = data.properties.reported.split('');
          data.columns = ['DATETIME', ...columns].map((item) => ({
            name: item,
            description: null,
            si: null,
          }));

          isProperty = false;
        }

        line.X = 1;
        if (line.sc !== NO_DATA) {
          if (numberIsBetween(line.sc, [4, 10])) {
            line.X = 2 ** (3 - line.sc);
          } else if (numberIsBetween(line.sc, [11, 20])) {
            line.X = 10 ** (10 - line.sc);
          }
        }

        if (line.yy.toString().length === 2) {
          line.yy += numberIsBetween(line.yy, [82, 99]) ? 1900 : 2000;
        }

        line.v1.forEach((value, minute) => {
          const tmp = [];
          tmp.push(new Date(line.yy, line.mm - 1, line.dd, line.hh, minute, 0, 0));

          [1, 2, 3].forEach((item) => {
            const vKey = `v${item}`;
            const bsKey = `bs${item}`;

            let value = line[vKey][minute];
            if (value !== NO_DATA) {
              if (line[bsKey] !== NO_DATA) {
                value += line[bsKey];
              }
              value *= line.X;
            }

            tmp.push(value);
          });

          data.rows.push(tmp);
        });
      }

      resolve(data);
    });
  });
}
