// controllers/ProjectController.js

class ProjectController {
  constructor(model) {
    this.model = model;
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
    const { status, search, order_by, page = 1, per_page = 10 } = req.query;
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

  async update(req, res) {
    const { id } = req.params;
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
    console.log("req.params", req.params)
    const { currentProjectId, newProjectId, taskId } = req.params;
    try {
      const result = await this.model.moveTaskToProject(currentProjectId, newProjectId, taskId);
      console.log(result)
      res.status(200).send({ message: 'Task moved successfully' });
    } catch (error) {
      console.log(error)
      res.status(500).send({ error: 'Failed to move task', msg: error.message });
    }
  }
}

module.exports = ProjectController;
