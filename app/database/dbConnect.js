import Sequelize from 'sequelize';
import models from './models';
import consoleLogSQL from './../lib/consoleLogSQL';

export let db;

let dbConnect = (dbPath) => {
  if (dbPath !== undefined && (db === undefined || db.sequelize === undefined)) {
    let sequelize = new Sequelize('database', null, null, {
      dialect: "sqlite",
      dialectModulePath: 'sqlite3-offline',
      storage: dbPath,
      logging: (log) => {
        if (!db.disableLogging) {
          if (process.send !== undefined) {
            process.send({consoleLogSQL: log});
          } else {
            consoleLogSQL(log);
          }
          // if (process.env.NODE_ENV === 'development') {
          //   if (process.env.ELECTRON_VERSION) {
          //     process.send({consoleLogSQL: log});
          //   } else {
          //     consoleLogSQL(log);
          //   }
          // } else {
          //   console.log(log);
          // }
        }
      },
      define: {
        timestamps: false
      }
    });

    db = {};

    for (let modelName in models) {
      let model = models[modelName](sequelize, Sequelize.DataTypes);
      db[model.name] = model;

      Object.keys(db).forEach(function (modelName) {
        if ("associate" in db[modelName]) {
          db[modelName].associate(db);
        }
      });
    }

    db.formatTime = 'YYYY-MM-DD HH:mm:ss.SSS';
    db.disableLogging = false;
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    db.close = () => {
      db.sequelize.close();
      console.log(db.path + ' connection closed');
      db = {};
    };
    db.setPragma = (values) => {
      if (!values) {
        values = [
          ['foreign_keys', 'ON'],
          ['synchronous', 'OFF'],
          ['journal_mode', 'MEMORY'],
        ];
      }
      return Promise.all(values.map((item) => {
        return db.sequelize.query("PRAGMA " + item[0] + " = " + item[1]);
      }));
    };
    db.path = dbPath;
    db.timeCreated = new Date();

    db.setPragma();
  }

  return db;
};

export default dbConnect;
// exports['default'] = dbConnect;
// module.exports = exports['default'];
