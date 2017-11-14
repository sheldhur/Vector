import {remote} from 'electron';
import domToImage from 'dom-to-image';
import resourcePath from './../../lib/resourcePath';
import * as fs from 'fs';

const {dialog} = remote;
const currentWindow = remote.getCurrentWindow();


export default function (props) {
  const {Menu} = remote;
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
            {name: 'PNG', extensions: ['png']},
          ],
        }, (filePath) => {
          if (filePath && filePath.length) {
            const chart = document.querySelector('#magnetopauseMap');
            chart.classList.add('screencapture');
            domToImage.toPng(chart).then((dataUrl) => {
              chart.classList.remove('screencapture');
              fs.writeFile(filePath, dataUrl.replace(/^data:image\/png;base64,/, ""), 'base64', (error) => {
                console.log(error);
              });
            });
          }
        });
      }
    }
  ]).popup(remote.getCurrentWindow());

  return menu;
}
