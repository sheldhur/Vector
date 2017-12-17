// @flow
import {app, BrowserWindow, ipcMain} from 'electron';
import log from 'electron-log';
import {autoUpdater} from "electron-updater";
import MenuBuilder from './menu';
import configureStore from './store/configureStore';
import appPackage from './package.json';

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = process.env.NODE_ENV === 'development' ? ['error', 'warn', 'info', 'verbose', 'debug', 'silly'] : 'info';
log.info('App starting...');

const store = configureStore();
let mainWindow = null;

if (process.env.NODE_ENV === 'development') {
  app.setName(appPackage.name);
  app.setVersion(appPackage.version);
  autoUpdater.updateConfigPath = './dev-app-update.yml';
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

// if (process.env.NODE_ENV === 'development') {
require('electron-debug')(); // eslint-disable-line global-require
const path = require('path'); // eslint-disable-line
const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
require('module').globalPaths.push(p); // eslint-disable-line
// }

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];

    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

    // TODO: Use async interation statement.
    //       Waiting on https://github.com/tc39/proposal-async-iteration
    //       Promises will fail silently, which isn't what we want in development
    return Promise
      .all(extensions.map(name => installer.default(installer[name], forceDownload)))
      .catch(console.log);
  }
};

app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1450,
    height: 800,
    backgroundColor: '#222222',
    title: `${app.getName()} ${app.getVersion()}`,
    webPreferences: {
      devTools: true,
    }
  });
  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.maximize();

    autoUpdater.checkForUpdates();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  const menuBuilder = new MenuBuilder(mainWindow, store);
  menuBuilder.buildMenu();
});


autoUpdater.on('download-progress', (progressObj) => {
  log.info('Downloaded ' + Math.round(progressObj.percent) + '% (' + progressObj.transferred + "/" + progressObj.total + ')');
});
autoUpdater.on('update-downloaded', (update) => mainWindow.send('dispatchFromMain', {update}));
ipcMain.on('installUpdate', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('autoUpdater.quitAndInstall()');
  } else {
    autoUpdater.quitAndInstall();
  }
});
