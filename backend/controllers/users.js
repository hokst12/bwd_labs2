const User = require('../models/User');

module.exports = {
  post_user: async (req, res) => {
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
    },

    get_users: async (req, res) => {
        try {
            const users = await User.findAll();
            res.json(users);
          } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении пользователей' });
          }
        },

    get_all_users: async (req, res) => {
        try {
            const users = await User.unscoped().findAll();
            res.json(users);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        },
    
    delete_user: async (req, res) => {
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
        },

    restore_user: async (req, res) => {
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
        },
};