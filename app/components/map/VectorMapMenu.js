import {remote, nativeImage} from 'electron';
import domToImage from 'dom-to-image';
import resourcePath from './../../lib/resourcePath';
import * as fs from 'fs';

const {dialog} = remote;


export default function (props) {
  const {Menu, MenuItem} = remote;
  const menu = new Menu();

  menu.append(new MenuItem({
    label: 'Stations',
    icon: resourcePath('./assets/icons/radar.png'),
    click: () => {
      props.stationActions.openWindowStation();
    }
  }));
  menu.append(new MenuItem({
    enabled: false,
    label: 'Show in window',
    visible: process.env.NODE_ENV === 'development',
    icon: resourcePath('./assets/icons/applications-blue.png'),
    click: () => {
      console.log('item 1 clicked')
    }
  }));
  menu.append(new MenuItem({
    enabled: props.dataNotEmpty,
    label: 'Save to image',
    icon: resourcePath('./assets/icons/image-export.png'),
    click: () => {
      dialog.showSaveDialog({
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
  }));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({
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
  }));

  menu.popup(remote.getCurrentWindow());

  return menu;
}
