const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
app.get('/events', async (req, res) => {
    try {
      const events = await Event.findAll({
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }]
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении мероприятий' });
    }
  });
  
  // Создание мероприятия
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

  app.get('/events/:id', async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id, {
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
  
  // Обновление мероприятия
  app.put('/events/:id', async (req, res) => {
    try {
      const { title, description, date } = req.body;
      
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
  
      // Валидация
      if (!title && !description && !date) {
        return res.status(400).json({ error: 'Не указаны данные для обновления' });
      }
  
      // Обновляем только переданные поля
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
  
  // Удаление мероприятия
  app.delete('/events/:id', async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
  
      await event.destroy();
  
      res.json({ 
        message: 'Мероприятие успешно удалено',
        deletedEventId: req.params.id 
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Ошибка при удалении мероприятия',
        details: error.message 
      });
    }
  });

  // Создание нового пользователя
app.post('/users', async (req, res) => {
    try {
      const { name, email } = req.body;
  
      // Валидация
      if (!name || !email) {
        return res.status(400).json({ error: 'Обязательные поля: name, email' });
      }
  
      // Проверка формата email
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
  
  // Получение списка пользователей
  app.get('/users', async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'createdAt'], // Выбираем только нужные поля
        order: [['createdAt', 'DESC']] // Сортировка по дате создания
      });
  
      res.json(users);
    } catch (error) {
      res.status(500).json({ 
        error: 'Ошибка при получении пользователей',
        details: error.message 
      });
    }
  });

async function start() {
  try {
    // Проверка подключения
    await sequelize.authenticate();
    Event.associate({ User });
    User.hasMany(Event, { foreignKey: 'createdBy' });
    console.log('Подключение к БД успешно');

    // Синхронизация моделей
    await sequelize.sync({
        logging: false// Отключаем логи только для этой операции
      });

    User.hasMany(Event, { foreignKey: 'createdBy' });
    Event.belongsTo(User, { foreignKey: 'createdBy' });
    console.log('Модели синхронизированы');

    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });

  } catch (error) {
    console.error('Ошибка запуска:', error);
    process.exit(1);
  }
}


start();