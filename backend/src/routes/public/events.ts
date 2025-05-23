import express from 'express';
import eventsController from '@/controllers/events';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Public/Events
 *     description: Публичные мероприятия
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Получить все активные мероприятия
 *     tags: [Public/Events]
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
router.get('/', eventsController.getEvents);

export default router;
