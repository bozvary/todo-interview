// controllers/ProjectController.js

const Task = require('../models/Task');
const { ObjectId } = require('mongodb');

class ProjectController {
  constructor(model) {
    this.model = model;
    this.taskModel = new Task(model.collection.client.db(model.collection.client.db().databaseName));
  }

  isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // It is used to validate the differnet JOI schemas, and return error if the validation failed.
  validateRequest(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { convert: false });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      next();
    };
  }

  async create(req, res) {
    try {
      // We create a new project based on the req.body, that is already validated by JOI
      const projectData = req.body;
      const project = await this.model.create(projectData);
      // Send back the created response, as it includes the created id, or we can send back only the id field
      res.status(201).send(project);
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to create project' });
    }
  }

  async getAll(req, res) {
    // Define sortable columns, so as the app grows with extra field, we can extend the sorting with ease
    const sortableColumns = ['id','startDate','dueDate','doneDate','createdAt'];
    // Setup default pagination config to prevent long results, more complex pagination can be implemented here to maange next/previous page
    const { status, search, order_by, page = 1, per_page = 50 } = req.query;
    const query = {};
    const sortOption = {};


    if (status) query.status = status;
    // Create regex search if its defined in the query
    // TODO: this can be validated for specific regex conditions
    if (search) query.name = { $regex: search, $options: 'i' };
    const skip = (page - 1) * per_page;

    // Sorting logic
    const orderByAsArray = Array.isArray(order_by) ? order_by : (order_by ? [order_by] : []);

    // specified fields and directions ([ASC] or [DESC]). e.g, ?order_by=id[ASC]. Takes multiple sorting e.g ?order_by=startDate[DESC]&order_by=dueDate[ASC]
    if (orderByAsArray.length > 0) {
      orderByAsArray.forEach(item => {

        // To manage the [ASC]/[DESC] structure, this way we can manage easily multiple columns, add change the sorting direction
        const [field, dir] = item.split('[');
        const orderDirection = dir ? dir.replace(']', '').trim() : 'ASC';

        // validate field and direction as only ASC or DESC are valid values, cannot be sorter other way
        if (sortableColumns.includes(field) && ['ASC', 'DESC'].includes(orderDirection)) {
          sortOption[field] = orderDirection == 'ASC' ? 1 : -1; // 1 for asc, -1 for desc
        }
      });
    }

    try {
      // Fetch all projects that meet the requirement status, search, sorting, pagination
      const projects = await this.model.findAll(query, sortOption, +per_page, skip);
      res.status(200).send(projects);
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to fetch projects' });
    }
  }

  async getTasksByProjectName(req, res) {
    const { projectName } = req.params;
    /*const encodedProjectName = decodeURIComponent(projectName);
    const query = {
      name: { $regex: encodedProjectName, $options: 'i' }
    }*/

    try {
      // Find the project by name
      const project = await this.model.findOne({ name: projectName })

      if (!project) {
        return res.status(404).send({ error: 'Project not found' });
      }

      const taskIds = project.tasks.map(id => new ObjectId(id)); // Convert string IDs to ObjectId, because we want to fetch by _id 
      const tasks = await this.taskModel.find({ _id: { $in: taskIds } }).toArray(); // Fetching tasks using their IDs from taskModel   
      // Return the tasks associated with the project
      res.status(200).send(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to fetch tasks' });
    }
  }

  async getTasksByProjectId(req, res) {
    const { projectId } = req.params;
    // Validate the ID
    if (!this.isValidObjectId(projectId)) {
      return res.status(400).send({ error: 'Invalid ID format. ID must be a 24-character hex string.' });
    }

    try {
      // Find the project by projectId
      const project = await this.model.findOne({ _id: new ObjectId(projectId) })

      if (!project) {
        return res.status(404).send({ error: 'Project not found' });
      }

      const taskIds = project.tasks.map(id => new ObjectId(id)); // Convert string IDs to ObjectId, because we want to fetch by _id 
      const tasks = await this.taskModel.find({ _id: { $in: taskIds } }).toArray(); // Fetching tasks using their IDs from taskModel   
      // Return the tasks associated with the project
      res.status(200).send(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to fetch tasks' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    // Validate the ID
    if (!this.isValidObjectId(id)) {
      return res.status(400).send({ error: 'Invalid ID format. ID must be a 24-character hex string.' });
    }
    const updateData = req.body;

    // Limit the updateable fields??
    try {
      const result = await this.model.update(id, updateData);
      if (result?.modifiedCount) {
        res.status(200).send({ message: 'Project updated' });
      } else {
        res.status(404).send({ error: 'Project not found' });
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to update project' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    // Validate the ID
    if (!this.isValidObjectId(id)) {
      return res.status(400).send({ error: 'Invalid ID format. ID must be a 24-character hex string.' });
    }
    try {
      // try to delete the project if its exists
      const result = await this.model.delete(id);
      if (result?.deletedCount) {
        res.status(200).send({ message: 'Project deleted' });
      } else {
        res.status(404).send({ error: 'Project not found' });
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to delete project' });
    }
  }

  async assignTaskToProject(req, res) {
    const { projectId, taskId } = req.params;
    // Validate the ID
    if (!this.isValidObjectId(projectId) || !this.isValidObjectId(taskId)) {
      return res.status(400).send({ error: 'Invalid ID format. ID must be a 24-character hex string.' });
    }
    try {
      const result = await this.model.assignTaskToProject(projectId, taskId);
      if (result.modifiedCount === 0) {
        return res.status(404).send({ error: 'Project not found or task already assigned' });
      }
      res.status(200).send({ message: 'Task assigned to project' });
    } catch (error) {
      res.status(500).send({ error: 'Failed to assign task to project' });
    }
  }

  async moveTaskToProject(req, res) {
    console.log("moveTaskToProject")
    const { currentProjectId, newProjectId, taskId } = req.params;
    // Validate the ID
    if (!this.isValidObjectId(currentProjectId) || !this.isValidObjectId(newProjectId) || !this.isValidObjectId(taskId)) {
      return res.status(400).send({ error: 'Invalid ID format. ID must be a 24-character hex string.' });
    }
    try {
      const result = await this.model.moveTaskToProject(currentProjectId, newProjectId, taskId);
      res.status(200).send({ message: 'Task moved successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).send({ error: 'Failed to move task', msg: error.message });
    }
  }
}

module.exports = ProjectController;
