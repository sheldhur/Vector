export default function (sequelize, DataTypes) {
  let Project = sequelize.define('Project', {
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    settings: {
      type: DataTypes.TEXT,
      set(value) {
        if (typeof value !== "string") {
          value = JSON.stringify(value, null, 2);
        }
        this.setDataValue('settings', value);
      },
      get() {
        let value = this.getDataValue('settings');
        if (typeof value === "string") {
          value = JSON.parse(value);
        }
        return value;
      }
    },
  }, {});

  return Project;
};
