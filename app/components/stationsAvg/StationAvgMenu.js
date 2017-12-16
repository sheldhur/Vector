import {remote} from 'electron';
import {message} from 'antd';
import domToImage from 'dom-to-image';
import resourcePath from '../../lib/resourcePath';
import * as fs from 'fs';

const {dialog} = remote;
const currentWindow = remote.getCurrentWindow();


export default function (props) {
  const {Menu} = remote;
  const menu = Menu.buildFromTemplate([
    {
      label: 'Export',
      icon: resourcePath('./assets/icons/blue-document-excel-csv.png'),
      click: () => {
        dialog.showSaveDialog(currentWindow, {
          title: 'Select path',
          defaultPath: 'latitudeAvgValues.csv',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save CSV',
          filters: [
            {name: 'CSV', extensions: ['csv']},
          ],
        }, (filePath) => {
          if (filePath && filePath.length) {
            let data = props.prepareDataForCsv();

            let fileContent = '';
            let columns = data[0];
            for (let time in data) {
              let string = [];
              for (let colName in columns) {
                string.push(data[time][colName] || null);
              }

              fileContent += string.join(';') + '\r\n';
            }

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
          defaultPath: 'stationAvgChar.png',
          properties: ['openFile', 'createDirectory'],
          buttonLabel: 'Save image',
          filters: [
            {name: 'PNG', extensions: ['png']},
          ],
        }, (filePath) => {
          if (filePath && filePath.length) {
            const chart = document.querySelector('#stationAvgChar');
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
    }, {type: 'separator'}, {
      label: 'Update chart',
      icon: resourcePath('./assets/icons/arrow-circle-double.png'),
      click: () => {
        props.stationActions.getLatitudeAvgValues();
      }
    }
  ]).popup(remote.getCurrentWindow());

  return menu;
}
