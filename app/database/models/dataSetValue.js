export default function (sequelize, DataTypes) {
  let DataSetValue = sequelize.define('DataSetValue', {
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    dataSetId: {type: DataTypes.INTEGER, allowNull: false},
    time: {type: DataTypes.TEXT, allowNull: false, defaultValue: '0000-00-00 00:00:00.000',},
    value: {type: DataTypes.REAL, allowNull: true},
    format: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
  }, {
    indexes: [
      {unique: true, fields: ['dataSetId', 'time'], order: 'ASC'}
    ]
  });

  return DataSetValue;
};
