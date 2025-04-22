const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // Явно указываем таблицу
      key: 'id'
    }
  },
}, {
  tableName: 'events',
  timestamps: false,
});

Event.associate = function(models) {
    Event.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

module.exports = Event;