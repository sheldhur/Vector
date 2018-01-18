export const LS_KEY_LAST_DB = 'lastDataBase';
export const LS_KEY_APP_SETTINGS = 'appSettings';

export const FILE_EXT_ALL = ['*'];
export const FILE_EXT_DB = ['db3', 'db'];

export const IMPORT_AVG = ['seconds', 'minutes'];
export const IMPORT_AVG_DATA = ['Only station data', 'All data'];
export const IMPORT_TYPE_DATA_SET = ['CDAWeb', 'GOES', 'CSV'].sort();
export const IMPORT_TYPE_STATION = ['IAGA-2002', 'IAGA-2000', 'CSV', 'CDAWeb', 'CARISMA', '210 MM', 'MagBase', 'SAMNET', 'IMAGE'].sort();

export const FORMAT_DATE_INPUT = 'DD.MM.YYYY';
export const FORMAT_TIME_INPUT = 'HH:mm';
export const FORMAT_DATETIME_INPUT = `${FORMAT_DATE_INPUT} ${FORMAT_TIME_INPUT}`;
export const FORMAT_DATE_SQL = 'YYYY-MM-DD HH:mm:ss.SSS';

export const DATASET_DISABLED = 0;
export const DATASET_ENABLED = 1;
export const DATA_SET_AXIS_Y = ['Linear', 'Log', 'Ordinal', 'Exponent'];
export const DATA_SET_COLOR = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

export const WINDOW_DATASET = 'WINDOW_DATASET';
export const WINDOW_MAGNETOPAUSE = 'WINDOW_MAGNETOPAUSE';
export const WINDOW_STATIONS = 'WINDOW_STATIONS';

export const VALUES_RAW = 0;
export const VALUES_AVG = 1;
export const VALUES_MAX = 2;
export const VALUES_MIN = 3;
export const VALUES_INTERPOLATED = 4;
export const VALUES_CONVERT_FORMAT = {
  [VALUES_RAW]: 'RAW',
  [VALUES_AVG]: 'AVG',
  [VALUES_MAX]: 'MAX',
  [VALUES_MIN]: 'MIN',
  [VALUES_INTERPOLATED]: 'INTRP',
};

export const STATION_DISABLED = 0;
export const STATION_ENABLED = 1;

export const AVG_CHART_COMP = ['dH', 'dD', 'dZ'];
export const AVG_CHART_HEMISPHERE = ['global', 'east', 'west'];

export const IS_PROD = process.env.NODE_ENV === 'production';
export const WORKER_PATH = `./worker.${IS_PROD ? 'prod' : 'dev'}.js`;

export const THEMES = ['Night', 'Light'];
export const LANGUAGES = [
  { code: 'en-US', name: 'English' },
  { code: 'ru-RU', name: 'Русский' },
];
export const MAP_WORLD_SCALE = ['1:50', '1:110'];
export const MAP_PROJECTION = ['Equirectangular', 'Stereographic'];

export const CSV_DELIIMITER = [',', ';'];

export const DEFAULT_SETTINGS = {
  appTheme: 'night',
  appLanguage: 'en-US',
  appAntiAliasing: true,
  appTimeShiftStep: 10,
  appPlayDelay: 0.1,
  appMapProjectionType: 'equirectangular',
  appMapScale: '1:110',
  appMapCountries: false,
  appMapSolarPoint: true,
  appMapTerminator: true,
  appMapColor: {
    water: '#a4bac7',
    land: '#d7c7ad',
    border: '#766951',
  },
  appCsvDelimiter: ';',
  projectTimeAvg: { by: 'minutes', value: 1 },
  projectTimePeriod: [null, null],
  projectTimeSelected: [null, null],
  projectMapLayerH: {
    enabled: true,
    scaleAuto: false,
    scale: 200,
    color: '#000000'
  },
  projectMapLayerZ: {
    enabled: true,
    scaleAuto: false,
    scale: 200,
    view: 'circle',
    color: {
      positive: '#d0021b',
      negative: '#2a47e2'
    }
  },
  projectAvgComponentLines: [
    {
      comp: 'dH', hemisphere: 'global', style: null, enabled: true
    },
    {
      comp: 'dH', hemisphere: 'east', style: null, enabled: true
    },
    {
      comp: 'dH', hemisphere: 'west', style: null, enabled: true
    },
  ],
  projectAvgLatitudeRanges: [
    [90, -90],
    [90, 75],
    [75, 60],
    [60, 30],
    [30, -30],
    [-30, -60],
    [-60, -75],
    [-75, -90],
  ],
  projectMagnetopause: {
    b: null,
    bz: null,
    pressureSolar: null,
  },
  projectMagnetopauseDataSets: []
};
