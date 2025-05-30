import { Request, Response, RequestHandler } from 'express';
import User from '@/models/User';
import { default as EventModel } from '@/models/Event';

const usersController = {
  getUsers: (async (req: Request, res: Response) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при получении пользователей',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  getUserInfoById: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'name', 'email'] // выбираем только нужные поля
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json({
        name: user.name,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при получении информации о пользователе',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  getUserCreatedEventsById: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Проверяем существование пользователя
      const userExists = await User.count({
        where: { id: userId }
      });

      if (!userExists) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const events = await EventModel.findAll({
        where: { createdBy: userId },
      });
      
      res.json(events);
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при получении мероприятий пользователя',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  getAllUsers: (async (req: Request, res: Response) => {
    try {
      const users = await User.unscoped().findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  deleteUser: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await User.findOne({
        where: { id: parseInt(req.params.id) },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      user.deletedAt = new Date();
      await user.save();

      res.json({
        message: 'Пользователь помечен как удалённый',
        deletedAt: user.deletedAt,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  restoreUser: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const user = await User.unscoped().findOne({
        where: { id: parseInt(req.params.id) },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (user.deletedAt === null) {
        return res.status(400).json({
          warning: 'Пользователь уже активен (не был удалён)',
          user: {
            id: user.id,
            name: user.name,
          },
        });
      }

      user.deletedAt = null;
      await user.save();

      res.json({
        message: 'Пользователь восстановлен',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,
};

export default usersController;
