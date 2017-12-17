process.versions.electron = process.env.ELECTRON_VERSION || '1.6.12';

import dbConnect from './database/dbConnect';
import errorToObject from './lib/errorToObject';
import workers from './workers';


//TODO: по сути бэкенд. Имеет смысл в рендере запросы к воркерам сделать аля API worker.stations.getLatitudeAvgValues() и держать пул воркеров.

let db;

process.on('message', async (data) => {
  if (!data) {
    return;
  }

  if (data.worker !== undefined) {
    if (db && db.path !== data.main.dbPath) {
      db.close();
      db = undefined;
    }

    if (db === undefined) {
      db = await dbConnect(data.main.dbPath);
    }

    try {
      workers[data.worker](db, data)
    } catch (e) {
      console.error(e);
      process.send({event: 'setError', data: errorToObject(e)});
    }
  }
});
