const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventPulse API',
      version: '1.0.0',
      description:
        'Event Management Backend API — authentication, events, registrations, and real-time announcements.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local server' },
      { url: '/', description: 'Current deployment' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJSDoc(options);
