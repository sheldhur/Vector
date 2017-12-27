import { remote } from 'electron';
import { message } from 'antd';
import domToImage from 'dom-to-image';
import resourcePath from '../../lib/resourcePath';
import * as fs from 'fs';

const { dialog } = remote;
const currentWindow = remote.getCurrentWindow();


export default function (props) {
  const { Menu } = remote;
  const menu = Menu.buildFromTemplate([
    {
      label: 'Save to image',
      icon: resourcePath('./assets/icons/image-export.png'),
      click: () => {
        dialog.showSaveDialog(currentWindow, {
          title: 'Select path for image',
          defaultPath: 'magnetopauseMap.png',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save image',
          filters: [
            { name: 'PNG', extensions: ['png'] },
          ],
        }, (filePath) => {
          if (filePath && filePath.length) {
            const chart = document.querySelector('#magnetopauseMap');
            chart.classList.add('screencapture');
            domToImage.toPng(chart).then((dataUrl) => {
              chart.classList.remove('screencapture');
              fs.writeFile(filePath, dataUrl.replace(/^data:image\/png;base64,/, ""), 'base64', (error) => {
                if (error) {
                  message.error(error.message, 6);
                  throw error;
                } else {
                  message.success(filePath + ' was saved', 3);
                }
              });
            });
          }
        });
      }
    }, {
      label: 'Range',
      icon: resourcePath('./assets/icons/globe-green.png'),
      submenu: [
        {
          label: '40 Re',
          type: 'radio',
          checked: props.state.range === 40,
          click: () => {
            props.setState({ range: 40 });
          }
        },
        {
          label: '60 Re',
          type: 'radio',
          checked: props.state.range === 60,
          click: () => {
            props.setState({ range: 60 });
          }
        }
      ]
    }
  ]).popup(remote.getCurrentWindow());

  return menu;
}
