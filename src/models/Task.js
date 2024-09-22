// models/Task.js
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



*/

class Task {
  constructor(db) {
    // Define a property that connected to the 'tasks' collection
    this.taskCollection = db.collection('tasks');
  }

  async create(taskData) {
    // TODO: we can add createdBy if we define user layer
    const { name, description, status, startDate, dueDate } = taskData;
    const task = { name, description, status, startDate, dueDate, doneDate: null, createdAt: new Date(), updatedAt: new Date() };
    return this.taskCollection.insertOne(task);
  }

  async findAll(query, sortOption, perPageNum, skip) {
    // If we implement soft delete as stated below, we might need to add/extend the query to exclude delted or achived records
    return this.taskCollection.find(query).sort(sortOption).skip(skip).limit(perPageNum).toArray();
  }

  async findById(id) {
    // Same as findAll, If we implement soft delete as stated below, we might need to add/extend the query to exclude delted or achived records
    return this.taskCollection.findOne({ _id: new ObjectId(id) });
  }

  async filterByName(query) {
    return await this.taskCollection.find(query).toArray();
  }

  async update(id, updateData) {
    // TODO: we can add updatedBy field if we define user layer
    updateData.updatedAt = new Date();

    
    // reset a task from “done” to “to-do”, should reset “start” and “done” dates
    // TODO: addition: manage it as a transaction because probably we need multiple updates if we connect projects and users.
    // TODO: const session = db.client.startSession(); // Start session for transaction
    // const session = db.client.startSession();
    // await session.withTransaction(
    // try catch finally {
      // await session.endSession();
    // }
    return this.taskCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }

  async delete(id) {
    // TODO: we can add deletedBy, deletedAt fields if we define user layer and we wanna implement soft delete or change it to 'archive'
    return this.taskCollection.deleteOne({ _id: new ObjectId(id) });
  }

  async updateStatus(id, status, updateFields) {
    updateFields.updatedAt = new Date();
    // reset a task from “done” to “to-do”, should reset “start” and “done” dates
    // TODO: addition: manage it as a transaction because probably we need multiple updates if we connect projects and users.
    // TODO: const session = db.client.startSession(); // Start session for transaction
    // const session = db.client.startSession();
    // await session.withTransaction(
    // try catch finally {
      // await session.endSession();
    // }

    return this.taskCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, ...updateFields } }
    );
  }
}

module.exports = Task;
