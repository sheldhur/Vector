export default function (sequelize, DataTypes) {
  let StationValue = sequelize.define('StationValue', {
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    stationId: {type: DataTypes.INTEGER, allowNull: false},
    time: {type: DataTypes.TEXT, allowNull: false, defaultValue: '0000-00-00 00:00:00.000',},
    compX: {type: DataTypes.REAL, allowNull: true, validate: {isFloat: true}},
    compY: {type: DataTypes.REAL, allowNull: true, validate: {isFloat: true}},
    compZ: {type: DataTypes.REAL, allowNull: true, validate: {isFloat: true}},
    // compF: {type: DataTypes.REAL, allowNull: true, validate: {isFloat: true}},
    format: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  }, {
    indexes: [
      {unique: true, fields: ['stationId', 'time'], order: 'ASC'},
      {fields: ['time'], order: 'ASC'}
    ]
  });

  return StationValue;
};
