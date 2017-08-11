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

      let isProperty = true;

      /**
       * block_structure/1hour (400character)
       NPD|LONG|YR   |MO   |DA   |E |HR   |OBS  |ORG|BLANKS|DATA-1|..|DATA-60|HR_MEAN|
       1-6|7-12|13-14|15-16|17-18|19|20-21|22-24|25 |26-34 |35-40 |..|389-394|395-400|

       file_structure
       |..E=X(H-component)..HR=0..|.. ..|..E=X(H)..HR=23..|  (400+1)x24=9624character
       |..E=Y(D-component)..HR=0..|.. ..|..E=Y(D)..HR=23..|  (400+1)x24=9624character
       |..E=Z(Z-component)..HR=0..|.. ..|..E=Z(Z)..HR=23..|  (400+1)x24=9624character

       */
      let structure = {
        npd: [1, 6],
        longitude: [7, 12],
        year: [13, 14],
        month: [15, 16],
        day: [17, 18],
        comp: [19, 19],
        hour: [20, 21],
        code: [22, 24],
        org: [25, 25],
        blanks: [26, 34],
        data: [35, 394],
        mean: [395, 400]
      };

      let tmp = {};
      let dataYearBase = parseInt(new Date().getFullYear().toString().match(/.{2}/g)[0]) * 100;
      let dataReported;

      let lineList = rawData.toString().split(/\n+/);
      lineList.forEach((line, i) => {
        line = line.trim();
        if (line !== '') {
          if (line.startsWith('#')) {
            let lineSplit = line.match(/^#\s+(.+)\s+(.+)/);
            if (lineSplit[1] === 'YEAR_BASE') {
              dataYearBase = parseInt(lineSplit[2]);
            } else if (lineSplit[1] === 'REPORTED') {
              dataReported = lineSplit[2];
            }
          } else {
            let lineSplit = {};
            for (let block in structure) {
              lineSplit[block] = line.substring(structure[block][0] - 1, structure[block][1]);
              if (['code', 'comp', 'org', 'blanks', 'data'].indexOf(block) == -1) {
                lineSplit[block] = parseFloat(lineSplit[block]);
              }
            }

            lineSplit.year = lineSplit.year + dataYearBase;
            lineSplit.npd = lineSplit.npd / 1000;
            lineSplit.latitude = 90 - lineSplit.npd;
            lineSplit.longitude = lineSplit.longitude / 1000;
            lineSplit.data = lineSplit.data.match(/.{6}/g).map((item) => parseFloat(item));

            if (isProperty) {
              data.properties.code = lineSplit.code;
              data.properties.geodeticLatitude = lineSplit.latitude;
              data.properties.geodeticLongitude = lineSplit.longitude;
              data.properties.reported = [];
              isProperty = false;
            }

            lineSplit.data.forEach((item, minute) => {
              let time = moment({
                year: lineSplit.year,
                month: lineSplit.month - 1,
                date: lineSplit.day,
                hours: lineSplit.hour,
                minutes: minute,
                seconds: 0,
                milliseconds: 0
              });

              if (tmp[time.valueOf()] === undefined) {
                tmp[time.valueOf()] = [time.toDate(), null, null, null]
              }

              let compCol = data.properties.reported.indexOf(lineSplit.comp);
              if (compCol === -1) {
                data.properties.reported.push(lineSplit.comp);
                compCol = data.properties.reported.indexOf(lineSplit.comp)
              }

              tmp[time.valueOf()][compCol + 1] = item * 0.1;
            });
          }
        }
      });

      data.rows = Object.values(tmp);

      if (dataReported) {
        data.properties.reported = dataReported.split('');
      } else if (data.rows[0][0] < new Date(2010, 7 - 1, 5, 0, 0, 0, 0)) {
        data.properties.reported = ['X','Y','Z'];
      }

      data.columns = ['DATETIME', ...data.properties.reported].map((item) => {
        return {
          name: item,
          description: null,
          si: null,
        }
      });
      data.properties.reported = data.properties.reported.join('');

      resolve(data);
    });
  });
}
