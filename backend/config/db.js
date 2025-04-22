const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: parseInt(process.env.PG_MAX_CONNECTIONS) || 28,
      min: 0,
      acquire: 30000,
      idle: parseInt(process.env.PG_IDLE_TIMEOUT) || 30000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

module.exports = sequelize; // Экспортируем ТОЛЬКО экземпляр sequelize