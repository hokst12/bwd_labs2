const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const swaggerOptions = require('./config/swaggerOptions');
const passport = require('passport');
require('./config/passport');
const authRoutes = require('./routes/auth');
const publicEventRoutes = require('./routes/public/events');
const protectedEventRoutes = require('./routes/protected/events');
const userRoutes = require('./routes/protected/users');
const {
  setupMorgan,
  setupCors,
  restrictMethodsForUntrusted,
  jsonErrorHandler
} = require('./config/middleware');

dotenv.config();

const app = express();

app.use(passport.initialize());

app.use(express.json());

app.use(setupMorgan());
app.use(setupCors());
app.use(restrictMethodsForUntrusted);
app.use(jsonErrorHandler);

// Публичные роуты
app.use('/events', publicEventRoutes);

// Приватные роуты
app.use('/auth', authRoutes);
app.use('/events', protectedEventRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 5000;

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Инициализация сервера
async function start() {
  try {
    await sequelize.authenticate();
    
    // Установка связей
    User.hasMany(Event, { foreignKey: 'createdBy' });
    Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

    // Синхронизация с БД
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
