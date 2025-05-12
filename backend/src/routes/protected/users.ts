import express from 'express';
import passport from 'passport';
import usersController from '../../controllers/users';

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Управление пользователями (требуется авторизация)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить всех активных пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
router.get('/', usersController.getUsers);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Получить всех пользователей (включая удалённых)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
router.get('/all', usersController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Пометить пользователя как удалённого
 *     tags: [Users]
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
router.delete('/:id', usersController.deleteUser);

/**
 * @swagger
 * /users/{id}/restore:
 *   post:
 *     summary: Восстановить удалённого пользователя
 *     tags: [Users]
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
router.post('/:id/restore', usersController.restoreUser);

export default router;
