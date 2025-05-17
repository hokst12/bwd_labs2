import { Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { emailService } from '@/services/emailService';
import requestIp from 'request-ip';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

interface LoginHistoryItem {
  ip: string;
  userAgent: string;
  date: Date;
}

function checkLoginHistory(
  user: InstanceType<typeof User>,
  currentIp: string | null,
  currentUserAgent: string | undefined,
): boolean {
  const MAX_HISTORY_ITEMS = 5;
  const history = user.get('loginHistory') as LoginHistoryItem[];

  if (!currentIp || !currentUserAgent) return false;

  const isKnown = history.some(
    (entry) => entry.ip === currentIp && entry.userAgent === currentUserAgent,
  );

  if (!isKnown) {
    user.setDataValue('loginHistory', [
      { ip: currentIp, userAgent: currentUserAgent, date: new Date() },
      ...history.slice(0, MAX_HISTORY_ITEMS - 1),
    ]);
    user.save();
  }

  return !isKnown;
}

const authController = {
  register: (async (req: Request<RegisterRequest>, res: Response) => {
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
        email: user.email,
      });
    } catch {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }) as unknown as RequestHandler,

  login: (async (
    req: Request<unknown, unknown, LoginRequest>,
    res: Response,
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    try {
      const user = await User.unscoped().findOne({ where: { email } });

      if (!user || !user.comparePassword(password)) {
        return res.status(401).json({ message: 'Неверный email или пароль' });
      }

      if (user.deletedAt) {
        return res.status(403).json({ message: 'Аккаунт деактивирован' });
      }

      const ip = requestIp.getClientIp(req);
      const userAgent = req.headers['user-agent'];
      const isNewDevice = checkLoginHistory(user, ip, userAgent);

      if (isNewDevice) {
        await emailService.sendSecurityAlert(
          user.email,
          userAgent || 'Unknown',
          ip || 'Unknown',
        );
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' },
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }) as unknown as RequestHandler,
};

export default authController;
