export default function (sequelize, DataTypes) {
  const DataSet = sequelize.define('DataSet', {
    id: {
      type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true
    },
    axisGroup: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { isInt: true }
    },
    name: { type: DataTypes.TEXT, allowNull: false },
    // description: {type: DataTypes.TEXT, allowNull: true},
    si: { type: DataTypes.TEXT, allowNull: false },
    style: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}',
      set(value) {
        if (typeof value !== 'string') {
          value = JSON.stringify(value);
        }
        this.setDataValue('style', value);
      },
      get() {
        let value = this.getDataValue('style');
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        return value;
      }
    },
    axisY: { type: DataTypes.TEXT, allowNull: true },
    badValue: {
      type: DataTypes.REAL,
      allowNull: true,
      validate: { isNumeric: true },
      set(value) {
        if (value === '') {
          value = null;
        }

        this.setDataValue('badValue', value);
      }
    },
    status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 1 },
  }, {});

  return DataSet;
}
