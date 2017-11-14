import {remote, nativeImage} from 'electron';
import domToImage from 'dom-to-image';
import resourcePath from './../../lib/resourcePath';
import windowManager from './../../lib/windowManager';
import {WINDOW_STATIONS} from './../../constants/app';
import * as fs from 'fs';

const {dialog} = remote;
const currentWindow = remote.getCurrentWindow();

export function openWindowStation(id) {
  let url = '/station';
  if (id) {
    url += `/${id}`;
  }

  const windowOptions = {
    minWidth: 800,
    minHeight: 600,
    width: '65%',
    height: '65%',
    backgroundColor: '#292829',
    title: 'Stations',
    icon: resourcePath('./assets/icons/radar.png'),
  };

  let win = windowManager.get(WINDOW_STATIONS);
  if (!win) {
    windowManager.open(WINDOW_STATIONS, url, windowOptions);
  } else {
    windowManager.show(WINDOW_STATIONS, url);
  }
}

export default function (props) {
  const {Menu, MenuItem} = remote;
  const menu = Menu.buildFromTemplate([
    {
      label: 'Stations',
      icon: resourcePath('./assets/icons/radar.png'),
      click: () => {
        openWindowStation();
      }
    }, {
      enabled: props.dataNotEmpty,
      label: 'Save to image',
      icon: resourcePath('./assets/icons/image-export.png'),
      click: () => {
        dialog.showSaveDialog(currentWindow, {
          title: 'Select path for image',
          defaultPath: 'mapChart.png',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save image',
          filters: [
            {name: 'PNG', extensions: ['png']},
          ],
        }, (filename) => {
          if (filename && filename.length) {
            const chart = document.querySelector('#mapChart');
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
      label: 'Projection',
      icon: resourcePath('./assets/icons/globe-green.png'),
      submenu: [
        {
          label: 'Equirectangular',
          type: 'radio',
          checked: props.state.projectionType === 'equirectangular',
          click: () => {
            props.setState({projectionType: 'equirectangular'});
          }
        },
        {
          label: 'Stereographic',
          type: 'radio',
          checked: props.state.projectionType === 'stereographic',
          click: () => {
            props.setState({projectionType: 'stereographic'});
          }
        }
      ]
    }
  ]);


  menu.popup(remote.getCurrentWindow());

  return menu;
}
