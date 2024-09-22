// routes/v1/taskRoutes.js
const express = require('express');
const TaskController = require('../../controllers/TaskController');
const Task = require('../../models/Task');

const { schema: taskSchema, schemaUpdate: schemaUpdate } = require('../../validators/taskSchema');

const createTaskRoutes = (db) => {
  const router = express.Router();
  // Create a taskModal by passing the DB instance to the constructur, so we can use the conencted db instance
  const taskModel = new Task(db);
  // Passing the taskModal to the TaskController
  // Task Controller manages the CRUD operations and extra functionialities
  const taskController = new TaskController(taskModel);

  // Validate the request with the taskScheme to prevent injecting invalid data
  router.post('/', taskController.validateRequest(taskSchema), taskController.create.bind(taskController));
  // We can use validator to define a schema for the query adn validate the input to prevent various vulnerabilities, e.g. invalid input, injection attacks, data integrity, limit, performance issue. 
  router.get('/', taskController.getAll.bind(taskController));
  router.get('/filter-by-name/:taskName', taskController.filterByName.bind(taskController));
  // Validate the request, we can restrict some update by key if we do not want to provide ability to change e.g. status for status changes use the 'status' endpoint
  router.put('/:id', taskController.validateRequest(schemaUpdate), taskController.update.bind(taskController));
  router.delete('/:id', taskController.delete.bind(taskController));
  // Update the status of the tasks based on the requirement
  router.patch('/:id/status', taskController.updateStatus.bind(taskController));

  return router;
};

module.exports = createTaskRoutes;
