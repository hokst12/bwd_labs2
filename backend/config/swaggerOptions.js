const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Events API',
        version: '1.0.0',
        description: 'API для управления мероприятиями и пользователями',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          AuthResponse: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: { $ref: '#/components/schemas/User' },
              isNewDevice: { type: 'boolean' }
            }
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              name: { type: 'string', example: 'Иван Иванов' },
              email: { type: 'string', format: 'email', example: 'ivan@example.com' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-05-20T12:00:00Z' },
              deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null }
            }
          },
          Event: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              title: { type: 'string', example: 'Концерт' },
              description: { type: 'string', example: 'Рок-фестиваль' },
              date: { type: 'string', format: 'date-time', example: '2024-06-20T19:00:00Z' },
              createdBy: { type: 'integer', example: 1 },
              deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
              creator: {
                $ref: '#/components/schemas/User'
              }
            }
          }
        }
      }
    },
    apis: ['./routes/public/events.js','./routes/protected/events.js','./routes/protected/users.js','./routes/auth.js'],
  };

  module.exports = swaggerOptions;