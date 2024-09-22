const request = require('supertest');
const express = require('express');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const taskRoutes = require('../src/routes/v1/taskRoutes');
const projectRoutes = require('../src/routes/v1/projectRoutes');
const app = express();

dotenv.config();
app.use(express.json());

describe('Project Routes', () => {
  let db;
  let client;
  let projectId;
  let taskIdToSwap;
  let projectIdToSwapFrom, projectIdToSwapTo;

  beforeAll(async () => {
    try {
      client = await MongoClient.connect(process.env.MONGODB_URI);
      db = client.db('todoList');
      app.use('/api/v1/projects', projectRoutes(db));
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up the database
    /*await db.collection('projects').deleteMany({});*/
    await client.close();
  });

  // Test for creating a project
  it('POST /api/v1/projects should create a project', async () => {
    const response = await request(app)
      .post('/api/v1/projects')
      .send({
          name: 'New project',
          description: 'Project Description',
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('insertedId', response.body.insertedId);
    expect(response.body).toHaveProperty('acknowledged', true);
    projectId = response.body.insertedId.toString(); // Store the ID of the created project, for future tests
  });

  // Test for getting all projects
  it('GET /api/v1/projects should return all projects', async () => {
    const response = await request(app).get('/api/v1/projects');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // Test for updating a project
  it('PUT /api/v1/projects/:id should update a project', async () => {
    const response = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .send({
        name: 'Updated Project Name',
        description: 'Updated Project Description',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Project updated');
  });


  // Test for deleting a project
  it('DELETE /api/v1/projects/:id should delete a project', async () => {
    const response = await request(app).delete(`/api/v1/projects/${projectId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Project deleted');
    console.log(response.body)
    console.log("delete projectId", projectId);
  });

  // Test for updating project that has been deleted, should return 404
  it('PUT /api/v1/projects/:id should update a project', async () => {
    const response = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .send({
        name: 'Updated Deleted Project Name',
        description: 'Updated Project Description',
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Project not found');
  });

  // Test for creating a project for projectIdToSwapFrom
  it('POST /api/v1/projects should create a project __FROM', async () => {
    const response = await request(app)
      .post('/api/v1/projects')
      .send({
          name: 'New project to move from',
          description: 'Project Description',
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('insertedId', response.body.insertedId);
    expect(response.body).toHaveProperty('acknowledged', true);
    projectIdToSwapFrom = response.body.insertedId.toString(); // Store the ID of the created project, for future tests
  });

  // Test for creating a project for projectIdToSwapTo
  it('POST /api/v1/projects should create a project __TO', async () => {
    const response = await request(app)
      .post('/api/v1/projects')
      .send({
          name: 'New project to move to',
          description: 'Project Description',
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('insertedId', response.body.insertedId);
    expect(response.body).toHaveProperty('acknowledged', true);
    projectIdToSwapTo = response.body.insertedId.toString(); // Store the ID of the created project, for future tests
  });
  
  
  // Test for creating a task
  it('POST /api/v1/tasks should create a task for move test', async () => {
    app.use('/api/v1/tasks', taskRoutes(db));
    const response = await request(app)
      .post('/api/v1/tasks')
      .send({
          name: 'New Task to Move',
          description: 'Task Description',
          status: 'done',
          startDate: '2024-09-22',
          dueDate: '2024-09-23'
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('insertedId', response.body.insertedId);
    expect(response.body).toHaveProperty('acknowledged', true);
    taskIdToSwap = response.body.insertedId.toString(); // Store the ID of the created task, for future tests
  });

  // Test for assigning a task to a project
  it('POST /api/v1/projects/:projectId/tasks/:taskId should assign a task to a project', async () => {
    const response = await request(app)
      .post(`/api/v1/projects/${projectIdToSwapFrom}/tasks/${taskIdToSwap}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task assigned to project');
  });

  // Test for moving a task to another project
  it('POST /api/v1/projects/:currentProjectId/move/:newProjectId/tasks/:taskId should move a task', async () => {
    const response = await request(app)
      .post(`/api/v1/projects/${projectIdToSwapFrom}/move/${projectIdToSwapTo}/tasks/${taskIdToSwap}`);

    console.log("movement", projectIdToSwapFrom, projectIdToSwapTo, taskIdToSwap);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task moved successfully');
  });

  // Test for getting all projects and filter for moved task
  it('GET /api/v1/projects should return all projects and check the moved task', async () => {
    const response = await request(app).get('/api/v1/projects');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    console.log("projectIdToSwapTo", projectIdToSwapTo)
    console.log("taskIdToSwap", taskIdToSwap)
    const toProject = response.body.filter((project) => project._id == projectIdToSwapTo);
    expect(toProject.length).toBe(1);
    const movedTask = toProject[0].tasks.filter((taskId) => taskId == taskIdToSwap);
    expect(movedTask?.[0]).toBe(taskIdToSwap);
    
  });



});