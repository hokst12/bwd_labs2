import morgan from 'morgan';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

export const setupMorgan = () => {
  return morgan((tokens, req: Request, res: Response) => {
    return [
      `[${new Date().toISOString()}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      `${tokens['response-time'](req, res)}ms`,
      `- body: ${JSON.stringify(req.body)}`,
    ].join(' ');
  });
};

export const setupCors = () => {
  return cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
  });
};

export const restrictMethodsForUntrusted = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const trustedDomains = process.env.TRUSTED_DOMAINS?.split(',') || [];
  const origin = req.headers.origin;

  if (['DELETE', 'PUT'].includes(req.method)) {
    if (!origin || !trustedDomains.includes(origin)) {
      return res.status(403).json({
        error: 'Метод запрещён для вашего домена',
      });
    }
  }
  next();
};

export const jsonErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request contains invalid JSON',
    });
  }
  next();
};
