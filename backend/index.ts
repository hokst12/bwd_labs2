import express from 'express';
import dotenv from 'dotenv';
import sequelize from './src/config/db';
import User from './src/models/User';
import Event from './src/models/Event';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './src/config/swaggerOptions';
import passport from './src/config/passport';
import authRoutes from './src/routes/auth';
import publicEventRoutes from './src/routes/public/events';
import protectedEventRoutes from './src/routes/protected/events';
import userRoutes from './src/routes/protected/users';
import {
  setupMorgan,
  setupCors,
  restrictMethodsForUntrusted,
  jsonErrorHandler,
} from './src/config/middleware';

dotenv.config();

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(setupMorgan());
app.use(setupCors());
app.use(restrictMethodsForUntrusted as express.RequestHandler);

app.use('/events', publicEventRoutes);
app.use('/auth', authRoutes);
app.use('/events', protectedEventRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 5000;
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(jsonErrorHandler as express.ErrorRequestHandler);

async function start() {
  try {
    await sequelize.authenticate();

    User.hasMany(Event, { foreignKey: 'createdBy' });
    Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

    await sequelize.sync({ logging: false, alter: true });
    console.log('Модели синхронизированы');

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`Swagger docs доступны по http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Ошибка запуска:', error);
    process.exit(1);
  }
}

start();
