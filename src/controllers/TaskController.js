// controllers/TaskController.js

class TaskController {
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
      // We create a new task based on the req.body, that is already validated by JOI
      const taskData = req.body;
      const task = await this.model.create(taskData);
      // Send back the created response, as it includes the created id, or we can send back only the id field
      res.status(201).send(task);
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to create task' });
    }
  }

  // TODO: Fetch project with parameter 'include'. If keys are defined in includes, that case we send back the included field as an object e.g include=tasks, send back tasks[{fullObject}, {fullObject}] insteadof tasks[taskId1, taskId2], this way we can prevent extra subqueries from the client side if they need to show the task details in the project.
  async getAll(req, res) {
    // Define sortable columns, so as the app grows with extra field, we can extend the sorting with ease
    const sortableColumns = ['id','startDate','dueDate','doneDate'];
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
      // Fetch all tasks that meet the requirement status, search, sorting, pagination
      const tasks = await this.model.findAll(query, sortOption, +per_page, skip);
      res.status(200).send(tasks);
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to fetch tasks' });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    // !!!! Limit the updateable fields e.g remove status field. Status field cannot be updated directly. Or need extra validation. Prepared in JOI schema validation
    try {
      const result = await this.model.update(id, updateData);
      if (result?.modifiedCount) {
        res.status(200).send({ message: 'Task updated' });
      } else {
        res.status(404).send({ error: 'Task not found' });
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to update task' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    try {
      // try to delete the task if its exists
      const result = await this.model.delete(id);
      if (result?.deletedCount) {
        res.status(200).send({ message: 'Task deleted' });
      } else {
        res.status(404).send({ error: 'Task not found' });
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to delete task' });
    }
  }

  // reset a task from “done” to “to-do”, should reset “start” and “done” dates
  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const updateFields = {};

    if (status === 'to-do') {
      updateFields.startDate = null;
      updateFields.doneDate = null;
    }
    if (status === 'done') {
      updateFields.doneDate = new Date();
    }
    

    try {
      const result = await this.model.updateStatus(id, status, updateFields);
      if (result?.modifiedCount) {
        res.status(200).send({ message: 'Task status updated' });
      } else {
        res.status(404).send({ error: 'Task not found' });
      }
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: 'Failed to update task status' });
    }
  }
}

module.exports = TaskController;
