// models/Proejct.js
const { ObjectId } = require('mongodb');

/*
_id, autogen
name
description
status
startData
dueDate
doneDate
createdAt
updatedAt
tasks []
*/

class Project {
  constructor(db) {
    // Define a property that connected to the 'projects' collection
    this.collection = db.collection('projects');    
  }

  async create(projectData) {
    // TODO: we can add createdBy if we define user layer
    const { name, description, status, startDate, dueDate } = projectData;
    const project = { name, description, status, startDate, dueDate, doneDate: null, createdAt: new Date(), updatedAt: new Date() };
    return this.collection.insertOne(project);
  }

  async findAll(query, sortOption, perPageNum, skip) {
    // If we implement soft delete as stated below, we might need to add/extend the query to exclude delted or achived records
    return this.collection.find(query).sort(sortOption).skip(skip).limit(perPageNum).toArray();
  }

  async findById(id) {
    // Same as findAll, If we implement soft delete as stated below, we might need to add/extend the query to exclude delted or achived records
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async findOne(query) {
    return this.collection.findOne(query);
  }

  async getTasksByProjectName(projectName) {
    try {
      const aggregationPipeline = [
        {
          $lookup: {
            from: 'tasks',
            localField: 'tasks',
            foreignField: '_id',
            as: 'taskDetails'
          }
        },
        {
          $match: { name: projectName }
        },
        {
          $project: {
            _id: 0, // Exclude _id from each project for security,
            'taskDetails._id': 0 // Exclude _id from each task in taskDetails for security,
          }
        }
      ];

      const taskDetails = await this.collection.aggregate(aggregationPipeline).toArray();
      return taskDetails[0]['taskDetails'];

    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to fetch tasks' });
    }
  }

  async update(id, updateData) {
    // TODO: we can add updatedBy field if we define user layer
    updateData.updatedAt = new Date();

    return this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }

  async delete(id) {
    // TODO: we can add deletedBy, deletedAt fields if we define user layer and we wanna implement soft delete or change it to 'archive'
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async updateStatus(id, status, updateFields) {
    updateFields.updatedAt = new Date();
    
    return this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, ...updateFields } }
    );
  }

  async assignTaskToProject(projectId, taskId) {
    // What other properties we want to update? e.g. task or project updatedAt field? if we do so, then transaction
    // updateFields.updatedAt = new Date();
    return this.collection.updateOne(
      { _id: new ObjectId(projectId) },
      { $addToSet: { tasks: taskId } } 
      /*{ $addToSet: { tasks: new ObjectId(taskId) } } */
    );
  }

  async moveTaskToProject(currentProjectId, newProjectId, taskId) {
    const session = this.collection.client.startSession();
    session.startTransaction();
    try {

      // Check if current project exists and contains the task
      const currentProject = await this.collection.findOne(
          { _id: new ObjectId(currentProjectId), tasks: taskId },
          { session }
      );
      /*tasks: new ObjectId(taskId)*/

      if (!currentProject) {
          throw new Error(`Project with id ${currentProjectId} does not exist or does not contain task ${taskId}`);
      }

      // Check if new project exists
      const newProject = await this.collection.findOne(
          { _id: new ObjectId(newProjectId) },
          { session }
      );

      if (!newProject) {
          throw new Error(`Project with id ${newProjectId} does not exist`);
      }

      // Remove task from current project
      await this.collection.updateOne(
        { _id: new ObjectId(currentProjectId) },
        { $pull: { tasks: taskId } },
        { session }
        /*{ $pull: { tasks: new ObjectId(taskId) } } */
      );

      // Add task to new project
      await this.collection.updateOne(
        { _id: new ObjectId(newProjectId) },
        { $addToSet: { tasks: taskId } },
        { session }
        /*{ $addToSet: { tasks: new ObjectId(taskId) } } */
      );

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      /*console.error(error)*/
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = Project;
