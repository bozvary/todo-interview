const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const taskRoutes = require('../src/routes/v1/taskRoutes');
const app = express();

dotenv.config();
app.use(express.json());

describe('Task Routes', () => {
  let db;
  let client;
  let taskId;

  beforeAll(async () => {
    try {
      client = await MongoClient.connect(process.env.MONGODB_URI);
      db = client.db('todoList');
      app.use('/api/v1/tasks', taskRoutes(db));
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up the database
    /*await db.collection('tasks').deleteMany({});*/
    await client.close();
  });

  // Test for creating a task
  it('POST /api/v1/tasks should create a task', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
          name: 'New Task',
          description: 'Task Description',
          status: 'to-do',
          startDate: '2024-09-22',
          dueDate: '2024-09-23'
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('insertedId', response.body.insertedId);
    expect(response.body).toHaveProperty('acknowledged', true);
    taskId = response.body.insertedId.toString(); // Store the ID of the created task, for future tests
  });

  // Test for getting all tasks
  it('GET /api/v1/tasks should return all tasks', async () => {
    const response = await request(app).get('/api/v1/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // Test for updating a task
  it('PUT /api/v1/tasks/:id should update a task', async () => {
    const response = await request(app)
      .put(`/api/v1/tasks/${taskId}`)
      .send({
        name: 'Updated Task',
        description: 'Updated Description',
        startDate: '2024-09-22',
        dueDate: '2024-09-23'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task updated');
  });

  // Test for updating task status
  it('PATCH /api/v1/tasks/:id/status should update task status', async () => {
    const response = await request(app)
      .patch(`/api/v1/tasks/${taskId}/status`)
      .send({ status: 'done' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task status updated');
  });

  // Test for deleting a task
  it('DELETE /api/v1/tasks/:id should delete a task', async () => {
    const response = await request(app).delete(`/api/v1/tasks/${taskId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task deleted');
    console.log(response.body)
    console.log("delete taskId", taskId);
  });

  // Test for updating task status
  it('PATCH /api/v1/tasks/:id/status should not update task status, because deleted task', async () => {
    console.log("update status taskId", taskId);
    const response = await request(app)
      .patch(`/api/v1/tasks/${taskId}/status`)
      .send({ status: 'done' });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Task not found');
  });


});