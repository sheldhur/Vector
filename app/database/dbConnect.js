import Sequelize from 'sequelize';
import models from './models';
import consoleLogSQL from '../lib/consoleLogSQL';

const Op = Sequelize.Op;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};

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
        }
      },
      define: {
        timestamps: false
      },
      operatorsAliases
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
