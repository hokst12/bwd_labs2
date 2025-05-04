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

dotenv.config();

const app = express();

app.use(passport.initialize());

app.use(morgan((tokens, req, res) => {
  return [
    `[${new Date().toISOString()}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    `${tokens['response-time'](req, res)}ms`,
    `- body: ${JSON.stringify(req.body)}`
  ].join(' ');
}));
app.use(express.json());


const simpleCors = cors({
  origin: true, // Разрешаем всем доменам
  methods: ['GET', 'POST', 'OPTIONS'], // Явно указываем разрешённые методы
  optionsSuccessStatus: 200
});

// Middleware для проверки DELETE/PUT
const restrictMethodsForUntrusted = (req, res, next) => {
  const trustedDomains = process.env.TRUSTED_DOMAINS.split(',');
  const origin = req.headers.origin;
  
  // Если это DELETE/PUT и домен недоверенный — блокируем
  if (['DELETE', 'PUT'].includes(req.method)) {
    if (!trustedDomains.includes(origin)) {
      return res.status(403).json({ 
        error: 'Метод запрещён для вашего домена' 
      });
    }
  }
  next();
};

// Применяем CORS
app.use(simpleCors);
app.use(restrictMethodsForUntrusted);

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
