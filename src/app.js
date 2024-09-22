// app.js
const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const createTaskRoutes = require('./routes/v1/taskRoutes');
const createProjectRoutes = require('./routes/v1/projectRoutes');
const errorHandler = require('./middlewares/errorHandler');
const setupSwagger = require('../swagger');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Setup Swagger
setupSwagger(app);

MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    const db = client.db('todoList');

    // This can be organised in a differnet way
    app.use('/api/v1/tasks', createTaskRoutes(db));

    // TODO: projects
    app.use('/api/v1/projects', createProjectRoutes(db));
  })
  .catch(err => console.error(err));

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
