const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
require('dotenv').config();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Регистрация и авторизация
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 example: "Иван Иванов"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 *       400:
 *         description: Неверные данные
 *       409:
 *         description: Email уже занят
 *       500:
 *         description: Ошибка сервера
 */
router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  // Валидация
  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    // Проверка существующего пользователя
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email уже используется' });
    }

    // Создание пользователя (пароль хешируется автоматически в модели User)
    const user = await User.create({ email, name, password });
    
    res.status(201).json({ 
      message: 'Регистрация успешна',
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT токен
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Неверный email или пароль
 *       500:
 *         description: Ошибка сервера
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Валидация входных данных
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }
  
    try {
      // Ищем пользователя (включая удалённых)
      const user = await User.unscoped().findOne({ where: { email } });
  
      // Проверяем существование пользователя и пароль
      if (!user || !user.comparePassword(password)) {
        return res.status(401).json({ message: 'Неверный email или пароль' });
      }
  
      // Проверяем, не удалён ли пользователь
      if (user.deletedAt) {
        return res.status(403).json({ message: 'Аккаунт деактивирован' });
      }
  
      // Генерируем токен
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Токен действует 24 часа
      );
  
      // Возвращаем данные пользователя (без пароля)
      const userData = user.get();
      delete userData.password;
      delete userData.deletedAt;
  
      res.json({
        token,
        user: userData
      });
  
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  });

module.exports = router;