const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');


dotenv.config();



const app = express();

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

app.use((req, res, next) => {
  if (['DELETE', 'PUT'].includes(req.method)) {
    const origin = req.headers.origin;
    const trustedDomains = process.env.TRUSTED_DOMAINS.split(',');

    if (!trustedDomains.includes(origin) && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Метод запрещён для вашего домена' });
    }
  }
  next();
});

const PORT = process.env.PORT || 5000;

// Конфигурация Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Events API',
      version: '1.0.0',
      description: 'API для управления мероприятиями и пользователями',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Иван Иванов' },
            email: { type: 'string', format: 'email', example: 'ivan@example.com' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-05-20T12:00:00Z' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null }
          }
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Концерт' },
            description: { type: 'string', example: 'Рок-фестиваль' },
            date: { type: 'string', format: 'date-time', example: '2024-06-20T19:00:00Z' },
            createdBy: { type: 'integer', example: 1 },
            deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
            creator: {
              $ref: '#/components/schemas/User'
            }
          }
        }
      }
    }
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Маршруты мероприятий

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить все активные мероприятия
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Список активных мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Ошибка сервера
 */
app.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      include: {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении мероприятий' });
  }
});

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое мероприятие
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - createdBy
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Концерт"
 *               description:
 *                 type: string
 *                 example: "Рок-фестиваль"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-20T19:00:00"
 *               createdBy:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Мероприятие создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Неверные входные данные
 *       500:
 *         description: Ошибка сервера
 */
app.post('/events', async (req, res) => {
  try {
    const { title, description, date, createdBy } = req.body;
    
    if (!title || !date || !createdBy) {
      return res.status(400).json({ 
        error: 'Обязательные поля: title, date, createdBy' 
      });
    }

    const event = await Event.create({
      title,
      description: description || null,
      date: new Date(date),
      createdBy
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при создании мероприятия',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /events/all:
 *   get:
 *     summary: Получить все мероприятия (включая удалённые)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Полный список мероприятий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Ошибка сервера
 */
app.get('/events/all', async (req, res) => {
  try {
    const events = await Event.unscoped().findAll({
      include: {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении мероприятий',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные мероприятия
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
app.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.unscoped().findOne({
      where: { id: req.params.id },
      include: {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email']
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении мероприятия',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Обновлённое мероприятие
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
app.put('/events/:id', async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    const event = await Event.findOne({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    if (!title && !description && !date) {
      return res.status(400).json({ error: 'Не указаны данные для обновления' });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);

    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при обновлении мероприятия',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Пометить мероприятие как удалённое
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Мероприятие помечено как удалённое
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
app.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    event.deletedAt = new Date();
    await event.save();

    res.json({ 
      message: 'Мероприятие помечено как удалённое',
      deletedAt: event.deletedAt
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при удалении мероприятия',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /events/{id}/restore:
 *   post:
 *     summary: Восстановить удалённое мероприятие
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Мероприятие восстановлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 event:
 *                   $ref: '#/components/schemas/Event'
 *       400:
 *         description: Мероприятие уже активно
 *       404:
 *         description: Мероприятие не найдено
 *       500:
 *         description: Ошибка сервера
 */
app.post('/events/:id/restore', async (req, res) => {
  try {
    const event = await Event.unscoped().findOne({
      where: { id: req.params.id }
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    if (event.deletedAt === null) {
      return res.status(400).json({ 
        warning: 'Мероприятие уже активно (не было удалено)',
        event: {
          id: event.id,
          title: event.title
        }
      });
    }

    event.deletedAt = null;
    await event.save();

    res.json({ 
      message: 'Мероприятие восстановлено',
      event: {
        id: event.id,
        title: event.title,
        date: event.date
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при восстановлении мероприятия',
      details: error.message 
    });
  }
});

// Маршруты пользователей

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Иван Иванов"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные входные данные или email уже существует
 *       500:
 *         description: Ошибка сервера
 */
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Обязательные поля: name, email' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }

    const user = await User.create({
      name,
      email
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    res.status(500).json({ 
      error: 'Ошибка при создании пользователя',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить всех активных пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера
 */
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
});

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Получить всех пользователей (включая удалённых)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Полный список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера
 */
app.get('/users/all', async (req, res) => {
  try {
    const users = await User.unscoped().findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Пометить пользователя как удалённого
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Пользователь помечен как удалённый
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user.deletedAt = new Date();
    await user.save();

    res.json({ 
      message: 'Пользователь помечен как удалённый',
      deletedAt: user.deletedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}/restore:
 *   post:
 *     summary: Восстановить удалённого пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Пользователь восстановлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Пользователь уже активен
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
app.post('/users/:id/restore', async (req, res) => {
  try {
    const user = await User.unscoped().findOne({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.deletedAt === null) {
      return res.status(400).json({ 
        warning: 'Пользователь уже активен (не был удалён)',
        user: {
          id: user.id,
          name: user.name
        }
      });
    }

    user.deletedAt = null;
    await user.save();

    res.json({ 
      message: 'Пользователь восстановлен',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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