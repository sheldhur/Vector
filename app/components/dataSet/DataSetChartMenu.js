import {remote, nativeImage} from 'electron';
import domToImage from 'dom-to-image';
import resourcePath from './../../lib/resourcePath';
import * as fs from 'fs';

const {dialog} = remote;
const currentWindow = remote.getCurrentWindow();


export default function (props) {
  const {Menu, MenuItem} = remote;
  const menu = new Menu();

  menu.append(new MenuItem({
    label: 'Data series',
    icon: resourcePath('./assets/icons/line-chart.png'),
    click: () => {
      props.dataSetActions.openWindowDataSet();
    }
  }));
  menu.append(new MenuItem({
    label: 'Export',
    enabled: false,
    visible: process.env.NODE_ENV === 'development',
    icon: resourcePath('./assets/icons/blue-document-excel-csv.png'),
    click: () => {
      console.log('"Export" clicked');
    }
  }));
  menu.append(new MenuItem({
    label: 'Show in window',
    icon: resourcePath('./assets/icons/applications-blue.png'),
    visible: process.env.NODE_ENV === 'development',
    enabled: false,
    click: () => {
      console.log('item 1 clicked')
    }
  }));
  menu.append(new MenuItem({
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
  }));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({
    label: 'Update chart',
    icon: resourcePath('./assets/icons/arrow-circle-double.png'),
    click: () => {
      props.dataSetActions.getData();
    }
  }));

  menu.popup(remote.getCurrentWindow());

  return menu;
}
