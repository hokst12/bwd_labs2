import express from 'express';
import passport from 'passport';
import eventsController from '@/controllers/events';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: Управление мероприятиями (требуется авторизация)
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
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
router.post('/', eventsController.postEvent);

/**
 * @swagger
 * /events/all:
 *   get:
 *     summary: Получить все мероприятия (включая удалённые)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
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
router.get('/all', eventsController.getAllEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
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
router.get('/:id', eventsController.getEventId);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
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
router.put('/:id', eventsController.putEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Пометить мероприятие как удалённое
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
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
router.delete('/:id', eventsController.deleteEvent);

/**
 * @swagger
 * /events/{id}/restore:
 *   post:
 *     summary: Восстановить удалённое мероприятие
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
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
router.post('/:id/restore', eventsController.restoreEvent);

export default router;
