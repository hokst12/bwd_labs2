const morgan = require('morgan');
const cors = require('cors');

// Настройка логгера Morgan
const setupMorgan = () => {
  return morgan((tokens, req, res) => {
    return [
      `[${new Date().toISOString()}]`,
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      `${tokens['response-time'](req, res)}ms`,
      `- body: ${JSON.stringify(req.body)}`
    ].join(' ');
  });
};

// Настройка CORS
const setupCors = () => {
  return cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200
  });
};

// Middleware для проверки DELETE/PUT
const restrictMethodsForUntrusted = (req, res, next) => {
  const trustedDomains = process.env.TRUSTED_DOMAINS.split(',');
  const origin = req.headers.origin;
  
  if (['DELETE', 'PUT'].includes(req.method)) {
    if (!trustedDomains.includes(origin)) {
      return res.status(403).json({ 
        error: 'Метод запрещён для вашего домена' 
      });
    }
  }
  next();
};

// Middleware для обработки ошибок JSON
const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'Invalid JSON', 
      message: 'The request contains invalid JSON' 
    });
  }
  next();
};

module.exports = {
  setupMorgan,
  setupCors,
  restrictMethodsForUntrusted,
  jsonErrorHandler
};