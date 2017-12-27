import cdaweb from './cdaweb';

export default function (filePath) {
  return cdaweb(filePath).then((data) => {
    if (data.properties) {
      if (data.properties.descriptor) {
        data.properties.code = data.properties.descriptor.split('>')[0];
      }

      if (data.properties.logicalSourceDescription) {
        const coord = data.properties.logicalSourceDescription.match(/\(lat\s+(\d+\.\d+),\s+long\s+(\d+\.\d+)\)/i);
        if (coord !== null) {
          data.properties.geodeticLatitude = parseFloat(coord[1]);
          data.properties.geodeticLongitude = parseFloat(coord[2]);
        }
      }
    }

    if (data.columns) {
      const columnKeys = [0, 2, 3, 4];
      data.columns = data.columns.filter((column, i) => columnKeys.indexOf(i) !== -1);
      data.rows = data.rows.map((row) => row.filter((column, i) => columnKeys.indexOf(i) !== -1));
    }

    data.properties.reported = 'HDZ';
    data.columns = ['DATETIME', 'H', 'D', 'Z'].map((item) => ({
      name: item,
      description: null,
      si: null,
    }));

    return data;
  });
}
