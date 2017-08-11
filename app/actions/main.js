import {push} from 'react-router-redux';
import {hashHistory} from 'react-router';
import {remote} from 'electron';
import moment from 'moment';
import * as fs from 'fs';
import deepAssign from './../lib/deepAssign';
import dbConnect from './../database/dbConnect';
import {DEFAULT_SETTINGS, LS_KEY_APP_SETTINGS, LS_KEY_LAST_DB} from './../constants/app';
import * as types from './../constants/main';

// let dbConnect = remote.require('./database/dbConnect');
let db;


export function setError(payload) {
  return {
    type: types.ERROR,
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
  }
}

export function saveLastDataBase(path) {
  return (dispatch) => {
    console.log('DB: ' + path);
    localStorage[LS_KEY_LAST_DB] = path;
    dispatch(setDataBasePath(path));
  }
}

export function getLastDataBase(openMain = true) {
  return (dispatch) => {
    if (localStorage[LS_KEY_LAST_DB] && localStorage[LS_KEY_LAST_DB] !== '') {
      const path = localStorage[LS_KEY_LAST_DB];
      // dispatch(setDataBasePath(null));
      try {
        const stat = fs.statSync(path);
        if (stat.isFile()) {
          dispatch(openDataBase(path, openMain));
        }
      } catch (e) {
        console.log('Can\'t open last DataBase: ' + path, e);
      }
    }
  }
}

export function saveSettings(values, useDefault = false) {
  return (dispatch, getState) => {
    let defaultSettings = useDefault ? {...DEFAULT_SETTINGS} : {...getState().main.settings};
    let settings = deepAssign(defaultSettings, {...values}, (destination, source) => {
      return source.length > 0 ? source : destination;
    });

    let settingsProject = JSON.stringify(settings.project, null, 2);
    let settingsApp = JSON.stringify(settings.app, null, 2);

    return db.Project.update({settings: settingsProject}, {where: {id: 1}})
      .then(() => localStorage[LS_KEY_APP_SETTINGS] = settingsApp)
      .then(() => dispatch(setSettings(settings)));
  }
}

export function loadSettings(id = 1) {
  return (dispatch) => {
    return db.Project.findById(id)
      .then((project) => {
        return {app: {}, project: project.settings}
      })
      .then((settings) => {
        const settingsApp = localStorage[LS_KEY_APP_SETTINGS];
        if (settingsApp && settingsApp !== '') {
          settings.app = JSON.parse(settingsApp);
        }

        return settings;
      })
      .then((settings) => dispatch(setSettings(settings)));
  }
}

export function openDataBase(path, openMain = true) {
  return (dispatch) => {
    try {
      if (db && db.sequelize !== undefined) {
        db.close();
        db = null;
      }
      db = dbConnect(path);

      db.sequelize.authenticate().then(() => {
        dispatch(loadSettings());
        dispatch(saveLastDataBase(path));
        if (openMain) {
          openMainPage();
        }
      });
    } catch (error) {
      console.error(error);
      dispatch(setError(error));
    }
  }
}

export function createDataBase(path, settings) {
  return (dispatch) => {
    try {
      if (db && db.sequelize !== undefined) {
        db.close();
        db = null;
      }
      db = dbConnect(path);

      db.sequelize.sync({force: true}).then(() => {
        db.Project.upsert({id: 1}, {where: {_id: 1}}).then(() => {
          dispatch(saveSettings(settings, true));
          dispatch(saveLastDataBase(path));
          dispatch(openMainPage());
        });
      });
    } catch (error) {
      console.error(error);
      dispatch(setError(error));
    }
  }
}

export function closeDataBase() {
  return (dispatch) => {
    if (db && db.sequelize !== undefined) {
      db.close();
      db = null;
      dispatch(hashHistory.push('/home'));
    }
  }
}

function openMainPage() {
  return hashHistory.push('/main');
}
