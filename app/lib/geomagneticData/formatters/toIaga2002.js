import { sprintf } from 'sprintf-js';

export default function (filePath, prop, dataRaw) {
  return new Promise((result) => {
    const format = {
      prop: ' %-22.22s %-45.45s|',
      comment: ' # %-66.66s|',
      head: '%-10s %-12s %-7s %-9s %-9s %-9s %-7s',
      column: '%-10s %-12s %-6s %9s %9s %9s %9s',
    };

    if (!prop.has('Reported')) {
      prop.Reported = 'XYZF';
    } else if (prop.get('Reported').toString().length < 4) {
      prop.set('Reported', `${prop.get('Reported').toString()}F`);
    }

    const data = [];
    if (prop.has('Format')) {
      data.push(sprintf(format.prop, 'Format', prop.get('Format')));
      prop.delete('Format');
    } else {
      data.push(sprintf(format.prop, 'Format', 'IAGA-2002'));
    }

    prop.forEach((value, key) => {
      data.push(sprintf(format.prop, key, value));
    });

    data.push(sprintf(format.comment, 'This data file was converted.'));

    let componentName = prop.get('Reported').toString().split('');
    componentName = componentName.map((item) => prop.get('IAGA CODE').toString() + item);
    data.push(sprintf(`${format.head}|`, 'DATE', 'TIME', 'DOY', ...componentName));

    dataRaw.forEach((values) => {
      const date = values.shift();
      values = values.map((item) => item.toFixed(2));

      if (values.length === 3) {
        values.push(0);
      }

      data.push(sprintf(format.column, date.format('YYYY-MM-DD'), date.format('HH:mm:ss.SSS'), date.dayOfYear(), ...values));
    });

    result(data);
  });
}
