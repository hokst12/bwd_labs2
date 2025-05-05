const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');
const requestIp = require('request-ip');

module.exports = {
  register: async (req, res) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email уже используется' });
      }

      const user = await User.create({ email, name, password });
      res.status(201).json({ 
        message: 'Регистрация успешна',
        id: user.id,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  login: async (req, res) => {
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

      const ip = requestIp.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const isNewDevice = checkLoginHistory(user, ip, userAgent);

      if (isNewDevice) {
        await emailService.sendSecurityAlert(user.email, userAgent, ip);
      }
  
      // Генерируем токен
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      // Возвращаем данные пользователя (без пароля)
      const userData = user.get();
      delete userData.password;
      delete userData.deletedAt;
  
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
  
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }

    function checkLoginHistory(user, currentIp, currentUserAgent) {
      const MAX_HISTORY_ITEMS = 5;
      const history = user.loginHistory;
      
      const isKnown = history.some(entry => 
        entry.ip === currentIp && 
        entry.userAgent === currentUserAgent
      );
    
      if (!isKnown) {
        user.loginHistory = [
          { ip: currentIp, userAgent: currentUserAgent, date: new Date() },
          ...history.slice(0, MAX_HISTORY_ITEMS - 1)
        ];
        user.save();
      }
    
      return !isKnown;
    }
  }
};