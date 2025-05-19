import { Request, Response, RequestHandler } from 'express';
import User from '@/models/User';
import Event from '@/models/Event';

interface EventRequestBody {
  title: string;
  description?: string;
  date: string;
  createdBy: number;
}

const eventsController = {
  getEvents: (async (req: Request, res: Response) => {
    try {
      const events = await Event.findAll({
        include: {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      });
      res.json(events);
    } catch {
      res.status(500).json({ error: 'Ошибка при получении мероприятий' });
    }
  }) as RequestHandler,

  postEvent: (async (
    req: Request<unknown, unknown, EventRequestBody>,
    res: Response,
  ) => {
    try {
      const { title, description, date, createdBy } = req.body;

      if (!title || !date || !createdBy) {
        return res.status(400).json({
          error: 'Обязательные поля: title, date, createdBy',
        });
      }

      const event = await Event.create({
        title,
        description: description || null,
        date: new Date(date),
        createdBy,
      });

      return res.status(201).json({ massage: 'мероприятие создано', event });
    } catch (error) {
      return res.status(500).json({
        error: 'Ошибка при создании мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  getAllEvents: (async (req: Request, res: Response) => {
    try {
      const events = await Event.unscoped().findAll({
        include: {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при получении мероприятий',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as RequestHandler,

  getEventId: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const event = await Event.unscoped().findOne({
        where: { id: parseInt(req.params.id) },
        include: {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при получении мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  putEvent: (async (
    req: Request<{ id: string }, unknown, EventRequestBody>,
    res: Response,
  ) => {
    try {
      const { title, description, date } = req.body;

      const event = await Event.findOne({
        where: { id: parseInt(req.params.id) },
      });

      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }

      if (!title && !description && !date) {
        return res
          .status(400)
          .json({ error: 'Не указаны данные для обновления' });
      }

      if (title) event.title = title;
      if (description) event.description = description;
      if (date) event.date = new Date(date);

      await event.save();

      res.json(event);
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при обновлении мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  deleteEvent: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const event = await Event.findOne({
        where: { id: parseInt(req.params.id) },
      });

      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }

      event.deletedAt = new Date();
      await event.save();

      res.json({
        message: 'Мероприятие помечено как удалённое',
        deletedAt: event.deletedAt,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при удалении мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,  

  subscribeToEvent: (async (req: Request<{ id: string }, unknown, { userId: number }>, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const { userId } = req.body;
  
      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
  
      if (event.createdBy === userId) {
        return res.status(400).json({ error: 'Создатель не может подписаться на собственное мероприятие' });
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
  
      if (event.subscribers.includes(userId)) {
        return res.status(400).json({ error: 'Пользователь уже подписан на это мероприятие' });
      }
  
      const updatedSubscribers = [...event.subscribers, userId];
      await event.update({
        subscribers: updatedSubscribers
      });
  
      res.json({
        message: 'Пользователь успешно подписан на мероприятие',
        subscribersCount: updatedSubscribers.length,
        subscribers: updatedSubscribers // Возвращаем обновлённый массив
      });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при подписке на мероприятие',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,
  
  unsubscribeFromEvent: (async (req: Request<{ id: string }, unknown, { userId: number }>, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const { userId } = req.body;
  
      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }
  
      if (!event.subscribers.includes(userId)) {
        return res.status(400).json({ error: 'Пользователь не подписан на это мероприятие' });
      }
  
      const updatedSubscribers = event.subscribers.filter(id => id !== userId);
      await event.update({
        subscribers: updatedSubscribers
      });
  
      res.json({
        message: 'Пользователь успешно отписан от мероприятия',
        subscribersCount: updatedSubscribers.length,
        subscribers: updatedSubscribers // Возвращаем обновлённый массив
      });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при отписке от мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  getEventParticipants: (async (req: Request<{ id: string; }>, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);

      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }

      const participants = await User.findAll({
        where: { id: event.subscribers },
        attributes: ['id', 'name', 'email'],
      });

      res.json({
        eventId: event.id,
        eventTitle: event.title,
        participants,
        participantsCount: participants.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при получении участников мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,

  restoreEvent: (async (req: Request<{ id: string }>, res: Response) => {
    try {
      const event = await Event.unscoped().findOne({
        where: { id: parseInt(req.params.id) },
      });

      if (!event) {
        return res.status(404).json({ error: 'Мероприятие не найдено' });
      }

      if (event.deletedAt === null) {
        return res.status(400).json({
          warning: 'Мероприятие уже активно (не было удалено)',
          event: {
            id: event.id,
            title: event.title,
          },
        });
      }

      event.deletedAt = null;
      await event.save();

      res.json({
        message: 'Мероприятие восстановлено',
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Ошибка при восстановлении мероприятия',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }) as unknown as RequestHandler,
  
};


export default eventsController;
