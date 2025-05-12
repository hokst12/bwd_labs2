import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  dialect: 'postgres';
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const sequelize = new Sequelize(
  process.env.PG_DATABASE as string,
  process.env.PG_USER as string,
  process.env.PG_PASSWORD as string,
  {
    host: process.env.PG_HOST as string,
    port: parseInt(process.env.PG_PORT as string),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: parseInt(process.env.PG_MAX_CONNECTIONS as string) || 28,
      min: 0,
      acquire: 30000,
      idle: parseInt(process.env.PG_IDLE_TIMEOUT as string) || 30000,
    },
  } as DatabaseConfig,
);

export default sequelize;
