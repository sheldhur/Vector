export default function (sequelize, DataTypes) {
  let Station = sequelize.define('Station', {
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.TEXT, allowNull: false},
    source: {type: DataTypes.TEXT, allowNull: false},
    reported: {type: DataTypes.TEXT, allowNull: false},
    latitude: {type: DataTypes.REAL, allowNull: false, validate: {isFloat: true}},
    longitude: {type: DataTypes.REAL, allowNull: false, validate: {isFloat: true}},
    status: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 1},
  }, {
    indexes: [
      {unique: true, fields: ['id'], order: 'ASC'},
      {unique: true, fields: ['name', 'source', 'latitude', 'longitude'], order: 'ASC'}
    ]
  });

  return Station;
};
