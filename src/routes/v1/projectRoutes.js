// routes/v1/projectRoutes.js
const express = require('express');
const ProjectController = require('../../controllers/ProjectController');
const Project = require('../../models/Project');

const { schema: projectSchema, schemaUpdate: schemaUpdate } = require('../../validators/projectSchema');

const createProjectRoutes = (db) => {
  const router = express.Router();
  // Create a projectModel by passing the DB instance to the constructur, so we can use the conencted db instance
  const projectModel = new Project(db);
  // Passing the projectModel to the ProjectController
  // Project Controller manages the CRUD operations and extra functionialities
  const controller = new ProjectController(projectModel);

  console.log("controller")
  console.log(controller.assignTaskToProject)
  // Assign atask to project
  router.post('/:projectId/tasks/:taskId', controller.assignTaskToProject.bind(controller));
  // Move Task from one project to another
  router.post('/:currentProjectId/move/:newProjectId/tasks/:taskId', controller.moveTaskToProject.bind(controller));
  // Validate the request with the projectSchema to prevent injecting invalid data
  router.post('/', controller.validateRequest(projectSchema), controller.create.bind(controller));
  // We can use validator to define a schema for the query adn validate the input to prevent various vulnerabilities, e.g. invalid input, injection attacks, data integrity, limit, performance issue. 
  router.get('/', controller.getAll.bind(controller));
  // Validate the request, we can restrict some update by key if we do not want to provide ability to change e.g. status for status changes use the 'status' endpoint
  router.put('/:id', controller.validateRequest(schemaUpdate), controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));
  

  // curl -X POST "http://localhost:3000/api/v1/projects/${currentProjectId}/move/${newProjectId}/tasks/${taskId}"
  return router;
};

module.exports = createProjectRoutes;
