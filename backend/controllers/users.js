const User = require('../models/User');

module.exports = {
    getUsers: async (req, res) => {
        try {
            const users = await User.findAll();
            res.json(users);
          } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении пользователей' });
          }
        },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.unscoped().findAll();
            res.json(users);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        },
    
    deleteUser: async (req, res) => {
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

    restoreUser: async (req, res) => {
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