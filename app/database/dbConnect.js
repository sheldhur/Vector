import * as fs from 'fs';
import Sequelize from 'sequelize';
import models from './models';
import consoleLogSQL from '../lib/consoleLogSQL';


export let db;
const INIT_TRY = { timeout: 1000, attempts: 10 };
const timeout = ms => new Promise(res => setTimeout(res, ms));
const { Op } = Sequelize;
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

const isSqliteFile = async (path) => {
  const header = 'SQLite format 3';
  return new Promise((resolve, reject) => {
    fs.open(path, 'r+', (openError, fd) => {
      if (openError) {
        reject(openError);
      }

      const buffer = Buffer.alloc(header.length);
      fs.read(fd, buffer, 0, header.length, 0, (readError) => {
        if (readError) {
          reject(readError);
        }

        if (buffer.toString() === header) {
          resolve(true);
        } else {
          reject(new Error('Is not SQLite3 file'));
        }
      });
    });
  });
};

const dbConnect = async (dbPath) => {
  if (dbPath !== undefined && (db === undefined || db.sequelize === undefined)) {
    let sequelize;

    await isSqliteFile(dbPath);

    /**
     * Sometimes ASAR can not unpack 'sqlite' node module in time
     * This error can get only then you spawn new child electron process with ELECTRON_RUN_AS_NODE flag
     * This code trying init 'sequelize' few times with timeout
     */
    for (let i = 1; i <= INIT_TRY.attempts; i++) {
      try {
        sequelize = new Sequelize('database', null, null, {
          dialect: 'sqlite',
          dialectModulePath: 'sqlite3-offline',
          storage: dbPath,
          logging: (log) => {
            if (!db.disableLogging) {
              if (process.send !== undefined) {
                process.send({ consoleLogSQL: log });
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
      } catch (e) {
        if (i === INIT_TRY.attempts) {
          throw e;
        } else {
          await timeout(INIT_TRY.timeout);
        }
      }

      if (sequelize) {
        break;
      }
    }

    db = {};

    for (const modelName in models) {
      const model = models[modelName](sequelize, Sequelize.DataTypes);
      db[model.name] = model;

      Object.keys(db).forEach((modelName) => {
        if ('associate' in db[modelName]) {
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
      console.log(`${db.path} connection closed`);
      db = {};
    };
    db.setPragma = async (values) => {
      if (!values) {
        values = [
          ['foreign_keys', 'ON'],
          ['synchronous', 'OFF'],
          ['journal_mode', 'MEMORY'],
        ];
      }

      const result = [];

      for (const key in values) {
        result[key] = await db.sequelize.query(`PRAGMA ${values[key][0]} = ${values[key][1]}`);
      }

      return result;
    };
    db.path = dbPath;
    db.timeCreated = new Date();

    await db.setPragma();
  }

  return db;
};


export default dbConnect;
