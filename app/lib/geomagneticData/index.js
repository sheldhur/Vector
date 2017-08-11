import carisma from './parsers/carisma';
import cdaWebData from './parsers/cdaWebData';
import csv from './parsers/csv';
import iaga2002 from './parsers/iaga2002';
import magBase from './parsers/magBase';
import mm210 from './parsers/mm210';
import samnet from './parsers/samnet';
import goes from './parsers/goes';

import toIaga2002 from './formatters/toIaga2002';

export default {
  carisma,
  cdaWebData,
  csv,
  iaga2002,
  magBase,
  mm210,
  samnet,
  goes,
  toIaga2002,
}
