import {remote} from 'electron';
import domToImage from 'dom-to-image';
import resourcePath from './../../lib/resourcePath';
import windowManager from './../../lib/windowManager';
import {WINDOW_DATASET, WINDOW_MAGNETOPAUSE} from './../../constants/app';
import * as fs from 'fs';

const {dialog} = remote;
const currentWindow = remote.getCurrentWindow();

function openWindowDataSet(id) {
  let url = '/dataSet';
  if (id) {
    url += `/${id}`;
  }

  const windowOptions = {
    minWidth: 800,
    minHeight: 600,
    width: '65%',
    height: '65%',
    backgroundColor: '#292829',
    title: 'Data sets',
    icon: resourcePath('./assets/icons/line-chart.png'),
  };

  let win = windowManager.get(WINDOW_DATASET);
  if (!win) {
    windowManager.open(WINDOW_DATASET, url, windowOptions);
  } else {
    windowManager.show(WINDOW_DATASET, url);
  }
}

function openWindowMagnetopause() {
  const url = '/magnetopause';

  const [width, height] = [700, 500];
  const windowOptions = {
    minWidth: width,
    minHeight: height,
    width,
    height,
    backgroundColor: '#292829',
    title: 'Magnetopause',
    icon: resourcePath('./assets/icons/line-chart.png'),
  };

  let win = windowManager.get(WINDOW_MAGNETOPAUSE);
  if (!win) {
    windowManager.open(WINDOW_MAGNETOPAUSE, url, windowOptions);
  } else {
    windowManager.show(WINDOW_MAGNETOPAUSE, url);
  }
}

export default function (props) {
  const {Menu} = remote;
  const menu = Menu.buildFromTemplate([
    {
      label: 'Data series',
      icon: resourcePath('./assets/icons/line-chart.png'),
      click: () => {
        openWindowDataSet();
      }
    }, {
      label: 'Export',
      enabled: false,
      visible: process.env.NODE_ENV === 'development',
      icon: resourcePath('./assets/icons/blue-document-excel-csv.png'),
      click: () => {
        console.log('"Export" clicked');
      }
    }, {
      label: 'Show in window',
      icon: resourcePath('./assets/icons/applications-blue.png'),
      visible: process.env.NODE_ENV === 'development',
      enabled: false,
      click: () => {
        console.log('item 1 clicked')
      }
    }, {
      enabled: props.dataNotEmpty,
      label: 'Save to image',
      icon: resourcePath('./assets/icons/image-export.png'),
      click: () => {
        dialog.showSaveDialog(currentWindow, {
          title: 'Select path for image',
          defaultPath: 'dataSetChart.png',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save image',
          filters: [
            {name: 'PNG', extensions: ['png']},
          ],
        }, (filename) => {
          if (filename && filename.length) {
            const chart = document.querySelector('#dataSetChart');
            chart.classList.add('screencapture');
            domToImage.toPng(chart).then((dataUrl) => {
              chart.classList.remove('screencapture');
              fs.writeFile(filename, dataUrl.replace(/^data:image\/png;base64,/, ""), 'base64', (error) => {
                console.log(error);
              });
            });
          }
        });
      }
    }, {
      enabled: props.dataNotEmpty,
      label: 'Magnetopause',
      click: () => {
        openWindowMagnetopause();
      }
    }, {
      type: 'separator'
    }, {
      label: 'Update chart',
      icon: resourcePath('./assets/icons/arrow-circle-double.png'),
      click: () => {
        props.dataSetActions.getData();
      }
    }
  ]).popup(remote.getCurrentWindow());

  return menu;
}
