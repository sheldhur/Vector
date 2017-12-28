import { remote } from 'electron';
import * as fs from 'fs';
import { push } from 'react-router-redux';
import {
  DEFAULT_SETTINGS,
  FILE_EXT_ALL,
  FILE_EXT_DB,
  FORMAT_DATE_SQL,
  LS_KEY_APP_SETTINGS,
  LS_KEY_LAST_DB
} from '../constants/app';
import * as types from '../constants/main';
import dbConnect from '../database/dbConnect';
import errorToObject from '../lib/errorToObject';

const { dialog } = remote;
const currentWindow = remote.getCurrentWindow();
let db;


export function setLoading(payload) {
  return {
    type: types.LOADING,
    payload
  };
}

export function setError(payload) {
  return {
    type: types.ERROR,
    payload
  };
}

export function setUpdate(payload) {
  return {
    type: types.UPDATE,
    payload
  };
}

export function setSettings(payload) {
  return {
    type: types.SETTINGS,
    payload,
    syncState: true
  };
}

export function setDataBasePath(payload) {
  return {
    type: types.DB_PATH,
    payload,
    syncState: true
  };
}

export function saveLastDataBase(path) {
  return (dispatch) => {
    localStorage[LS_KEY_LAST_DB] = path;
    dispatch(setDataBasePath(path));
  };
}

export function getLastDataBase(openMain = true) {
  return (dispatch) => {
    if (localStorage[LS_KEY_LAST_DB] && localStorage[LS_KEY_LAST_DB] !== '') {
      const path = localStorage[LS_KEY_LAST_DB];
      try {
        const stat = fs.statSync(path);
        if (stat.isFile()) {
          dispatch(openDataBase(path, openMain));
        }
      } catch (e) {
        console.error(e);
        dispatch(setError(errorToObject(new Error('Can\'t open last database: ' + path))));
      }
    } else {
      dispatch(setDataBasePath(null));
    }
  }
}

export function saveSettings(values, useDefault = false) {
  return async (dispatch, getState) => {
    const defaultSettings = useDefault ? DEFAULT_SETTINGS : getState().main.settings;
    const settings = { ...defaultSettings, ...values };

    const tmp = { app: {}, project: {} };
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      let type = key.startsWith('project') ? 'project' : 'app';
      let value = settings[key];

      if (key === 'projectTimePeriod' || key === 'projectTimeSelected') {
        value = value.map(item => item.format(FORMAT_DATE_SQL));
      }

      tmp[type][key] = value;
    });

    const settingsProject = JSON.stringify(tmp.project, null, 2);
    const settingsApp = JSON.stringify(tmp.app, null, 2);

    await db.Project.update({ settings: settingsProject }, { where: { id: 1 } });
    localStorage[LS_KEY_APP_SETTINGS] = settingsApp;

    return dispatch(setSettings(settings));
  }
}

export function loadSettings(id = 1) {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const project = await db.Project.findById(id);
      const settingsProject = { ...project.settings };
      const settingsAppString = localStorage[LS_KEY_APP_SETTINGS];
      const settingsApp = (settingsAppString && settingsAppString !== '') ? JSON.parse(settingsAppString) : {};

      return dispatch(setSettings({ ...settingsApp, ...settingsProject }));
    } catch (e) {
      console.error(e);
      dispatch(setError(errorToObject(e)));
    }
  }
}

async function createConnect(path) {
  if (db && db.sequelize !== undefined) {
    db.close();
    db = null;
  }
  db = await dbConnect(path);
}

export function openDataBase(path, openMain = true) {
  return async (dispatch) => {
    try {
      await createConnect(path);
      await db.sequelize.authenticate();
      await dispatch(loadSettings());
      dispatch(saveLastDataBase(path));
      if (openMain) {
        dispatch(openMainPage());
      }
    } catch (e) {
      console.error(e);
      dispatch(setError(errorToObject(e)));
    }
  }
}

export function createDataBase(path, settings) {
  return async (dispatch) => {
    try {
      await createConnect(path);
      await db.sequelize.sync({ force: true });
      await db.Project.upsert({ id: 1 }, { where: { _id: 1 } });
      await dispatch(saveSettings(settings, true));
      dispatch(saveLastDataBase(path));
      openMainPage();
    } catch (e) {
      console.error(e);
      dispatch(setError(e));
    }
  }
}

export function closeDataBase() {
  return (dispatch) => {
    if (db && db.sequelize !== undefined) {
      db.close();
      db = null;
      dispatch(push('/home'));
    }
  }
}

function openMainPage() {
  return (dispatch, getState) => {
    if (getState().router.location.pathname !== '/main') {
      return dispatch(push('/main'));
    }
  }
}

export function dialogOpenCreateDataBase(settings) {
  return (dispatch) => {
    let showDialog = !settings ? dialog.showOpenDialog : dialog.showSaveDialog;
    showDialog(currentWindow, {
      title: !settings ? 'Select database file' : 'Select path for new database',
      defaultPath: 'project.db3',
      properties: !settings ? ['openFile'] : ['openFile', 'createDirectory', 'promptToCreate'],
      buttonLabel: !settings ? 'Open database' : 'Create database',
      filters: [
        { name: 'Database', extensions: FILE_EXT_DB },
        { name: 'All Files', extensions: FILE_EXT_ALL }
      ],
    }, (filePaths) => {
      if (filePaths && filePaths.length) {
        if (settings) {
          settings.project.time.period = {
            start: settings.project.time.period.start.millisecond(0).toISOString(),
            end: settings.project.time.period.end.millisecond(0).toISOString(),
          };
          settings.project.time.selected = settings.project.time.period;

          dispatch(createDataBase(filePaths, settings));
        } else {
          dispatch(openDataBase(filePaths[0]));
        }
      }
    });
  }
}
