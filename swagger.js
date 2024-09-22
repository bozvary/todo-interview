// ./swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const path = require('path');

const swaggerOptions = {
  failOnErrors: false, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TODO',
      version: '1.0.0',
      description: 'API for managing task and projects',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local server'
      }
    ]
  },
  apis: ['./swagger-api/*.yaml'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

function setupSwagger(app) {
  var options = {
    explorer: false,
  };
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));
}

module.exports = setupSwagger;










