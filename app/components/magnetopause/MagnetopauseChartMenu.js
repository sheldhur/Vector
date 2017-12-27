import { remote } from 'electron';
import { message } from 'antd';
import domToImage from 'dom-to-image';
import resourcePath from '../../lib/resourcePath';
import * as fs from 'fs';
import moment from 'moment';
import { FORMAT_DATE_SQL } from '../../constants/app';

const { dialog } = remote;
const currentWindow = remote.getCurrentWindow();


export default function (props) {
  const { Menu } = remote;
  const menu = Menu.buildFromTemplate([
    {
      label: 'Export',
      icon: resourcePath('./assets/icons/blue-document-excel-csv.png'),
      click: () => {
        dialog.showSaveDialog(currentWindow, {
          title: 'Select path',
          defaultPath: 'magnetopausePosition.csv',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save CSV',
          filters: [
            { name: 'CSV', extensions: ['csv'] },
          ],
        }, (filePath) => {
          if (filePath && filePath.length) {
            let fileContent = props.data.map((item) => {
              const time = moment(item.time).format(FORMAT_DATE_SQL);
              const value = item.value ? item.value.toFixed(5).replace('.', ',') : '';
              return `${time};${value}`;
            }).join("\r\n");

            fs.writeFile(filePath, fileContent, (error) => {
              if (error) {
                message.error(error.message, 6);
                throw error;
              } else {
                message.success(filePath + ' was saved', 3);
              }
            });
          }
        });
      }
    }, {
      enabled: props.dataNotEmpty,
      label: 'Save to image',
      icon: resourcePath('./assets/icons/image-export.png'),
      click: () => {
        dialog.showSaveDialog(currentWindow, {
          title: 'Select path for image',
          defaultPath: 'magnetopauseChar.png',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save image',
          filters: [
            { name: 'PNG', extensions: ['png'] },
          ],
        }, (filePath) => {
          if (filePath && filePath.length) {
            const chart = document.querySelector('#magnetopauseChart');
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
    }
  ]).popup(remote.getCurrentWindow());

  return menu;
}
