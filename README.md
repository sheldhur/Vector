# Vector
App for visualize Earth's geomagnetic structure in perioads of Solar activity by observatory and satelite data.

Built with [Electron](https://github.com/atom/electron), [React](https://facebook.github.io/react/), [Redux](https://github.com/reactjs/redux), [D3](https://github.com/d3/d3), [Ant Design](https://github.com/ant-design/ant-design), [Sequelize](https://github.com/sequelize/sequelize/), [SQLite](https://github.com/DenisCarriere/sqlite3-offline).

![Example](/example/result.gif)

## Functional
* Show map of ionospheric current equivalent's by Earth observatories data
* Calculate average latitude values of components geomagnetic field (X, Y, Z, H, D)
* Show magnetopause position by model [Lin et. al]() 

## Support data formats
* Network of observatories
    * [CARISMA](http://carisma.ca/station-information)
    * [INTERMAGNET](http://www.intermagnet.org/imos/imotblobs-eng.php) (IAGA-2002)
    * [210 MM](http://stdb2.isee.nagoya-u.ac.jp/mm210/1-min_data/Readme.txt)
    * [SAMNET](http://spears.lancs.ac.uk/samnet/)
    * [RSSI MAGBASE](http://magbase.rssi.ru/HTML/MAG_CD.HTM)
    * [THEMIS](https://cdaweb.sci.gsfc.nasa.gov/cdaweb/istp_public/) (from CDAWeb)
    * [IMAGE](http://space.fmi.fi/image/index.html) (column_old format)
* Additional data
    * [CDAWeb](https://cdaweb.sci.gsfc.nasa.gov/cdaweb/istp_public/)
    * [GOES](https://www.ngdc.noaa.gov/stp/satellite/goes/index.html)
    * CSV

## Features
* Add [magnetogram inversion technique](https://www.researchgate.net/publication/226075790_The_magnetogram_inversion_technique_and_some_applications) (MIT)

## How To Use
### Install and run
[Download](https://github.com/sheldhur/Vector/releases) latest released app, then extract and run the executable.

### Run from sources
``` shell
git clone https://github.com/sheldhur/Vector
cd Vector
npm install
cd app
npm install
cd ..
npm run dev
```

## Building app
##### Pack into an app for your platform from command line:
``` shell
npm run package
```

##### Building windows apps from non-windows platforms
Please checkout [Building windows apps from non-windows platforms](https://github.com/maxogden/electron-packager#building-windows-apps-from-non-windows-platforms).

#### License [MIT](LICENSE)
