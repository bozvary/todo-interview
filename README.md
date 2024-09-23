[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

# Tasks & Projects API

## Overview

The project is a "Simple Tasks & Projects API" developed using Node.js, ExpressJs and MongoDB. 
The API allows to manage tasks and projects, including features like creating, editing, deleting, sorting, and filtering tasks and projects, and assigning tasks to projects.


### Key Features:
- Create, list, edit, delete tasks and projects
- Mark tasks as "to-do"/"done."
- Filter tasks by status/projectName
- Sort tasks by dates (start, due, done)
- Sort projects by dates (start, due)
- Assign tasks to projects
- Search tasks by name using Regex


### !!!! Comments/Improvement !!!!

- We rely on the DB response to manage project and task updates anddeletions when the record cannot be found.
- We can perform a seperate query to check if the record with the given ID is exist, otherwise throw error.
- Where should the "startDate" field be managed? It is set to null when we reset the status.
- ID validation: input must be a 24 character hex string, 12 byte Uint8Array, or an integer
- "filter tasks by project name" it might be better by to filter by id

## Installation

### Prerequisites
- **Node.js**: Install from [here](https://nodejs.org/).
- **MongoDB**: Download and install MongoDB locally from Docker Image[here](https://hub.docker.com/_/mongo).
   
 !!!!! MongoDB needs to run in RS mode  
   
```bash
   $ docker run -d --network mongo-network --name mongo-db \
   -e MONGO_INITDB_DATABASE=todoList \
   -p 27017:27017 \
   mongo --replSet rs0
```

```bash
   $ docker exec -it mongo-db mongosh

   mongosh$
   rs.initiate({
      _id: "rs0",
      members: [
         { _id: 0, host: "localhost:27017" }
      ]
   });

   rs.status();

```   
   

```bash
   $ docker run --network mongo-network -e ME_CONFIG_MONGODB_SERVER=mongo-db -p 8081:8081 mongo-express
```


### Steps

1. **Clone the repository**:
   ```bash
   $ git clone https://github.com/bozvary/todo-interview.git
   $ cd todo-interview
   $ npm install
   ```

2. Create a .env file inn the root folder, or use sample.env 
   ```bash
   $ touch .env #create
   $ cp sample.env .env #copy the sample
   ```

(extra optional step)
   ```bash
      BONUS/db_schema includes a sample for the schema validation for MongoDB
   ```

3. Run
   ```bash
   $ npm run dev
   ```

4. Test
   ```bash
   $ npm test
   ```

## API Endpoints

Check SWAGGER API for more details

### Tasks Endpoints

Prefix: **/api/{v}**

| Method   | Endpoint                           | Description                                  |
| :--------| :--------------------------------  | :------------------------------------------- |
| POST     | /tasks                             | Create a new task
| GET      | /tasks                             | Get/List all tasks
| PUT      | /tasks/:id                         | Edit an existing task
| DELETE   | /tasks/:id                         | Delete a task
| PATCH    | /tasks/:id/status                  | Mark a task as to-do/done
| GET      | /tasks?status=done                 | Filter tasks by status
| GET      | /tasks?search=keyword              | Search tasks by name
| GET      | /tasks?order_by=startDate[DESC]    |
|          |  &order_by=dueDate[ASC]            | Sort tasks by start, due, or done dates

#### Create a new task

```http
  POST /api/{v}/tasks
```
| Parameter        | Type     | Description                   |
| :--------------- | :------- | :---------------------------- |
| `name`           | `string` | **Required**. 1-255 Character |
| `description`    | `string` | **Required**. 1-255 Character |
| `status`         | `string` | Optional. to-do / done        |
| `startDate`      | `date`   | Optional. Date (YYYY-MM-DD)   |
| `dueDate`        | `date`   | Optional. Date (YYYY-MM-DD)   |

  ```bash
curl -X POST http://localhost:3000/api/v1/tasks \
   -H "Content-Type: application/json" \
   -d '{
     "name": "Create containers",
     "description": "Create MongoDb and Mongo UI containers",
     "status": "to-do",
     "startDate": "2024-09-22",
     "dueDate": "2024-09-23"
   }'
   ```
#### Get/List all tasks

```http
  GET /api/{v}/tasks
```
| Parameter        | Type     | Description                                     |
| :--------------- | :------- | :---------------------------------------------- |
| `status`         | `string` | Optional. Filter by status. to-do / done        |
| `search`         | `string` | Optional. Search by task name. 1-255 Character  |
| `order_by`       | `string` | Optional. Order by field                        |
| `per_page`       | `number` | Optional. Tasks per page. Default 50            |

```bash
curl "http://localhost:3000/api/v1/tasks?status=done&search=today&order_by=startDate%5BASC%5D&per_page=10"
```

#### Edit an existing task
```http
  PUT /api/{v}/tasks/:id
```
| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |
| `id`             | `Task ID`   | **Required**. Valid ObjectId                    |
| `name`           | `string`    | Optional. 1-255 Character                       |
| `description`    | `string`    | Optional. 1-255 Characters                      |
| `startDate`      | `date`      | Optional. Date (YYYY-MM-DD)                     |
| `dueDate`        | `date`      | Optional. Date (YYYY-MM-DD)                     |

```bash
curl -X PUT http://localhost:3000/api/v1/tasks/{id} \
   -H "Content-Type: application/json" \
   -d '{
     "name": "Updated task name",
     "description": "Updated description",
     "startDate": "2024-09-21",
     "dueDate": "2024-09-23"
   }'
```

#### Delete a task
```http
  DELETE /api/{v}/tasks/:id
```
| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |
| `id`             | `Task ID`   | **Required**. Valid ObjectId                    |

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/{id}
```

#### Mark a task as to-do/done
```http
  PATCH /api/{v}/tasks/:id/status
```
| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |
| `id`             | `Task ID`   | **Required**. Valid ObjectId                    |
| `status`         | `string`    | **Required**. to-do / done                      |

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/{id}/status \
   -H "Content-Type: application/json" \
   -d '{
     "status": "done"
   }'
```



```http
  PATCH /api/{v}/tasks/:id/reset
```
| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |
| `id`             | `Task ID`   | **Required**. Valid ObjectId                    |

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/{id}/reset
```




### Projects Endpoints
Prefix: **/api/{v}**

| Method   | Endpoint                                                      | Description                                  |
| :--------| :----------------------------------------------------------   | :------------------------------------------- |
| POST     | /projects                                                     | Create a new project
| GET      | /projects                                                     | Get/List all projects
| PUT      | /projects/:id                                                 | Edit an existing project
| DELETE   | /projects/:id                                                 | Delete a project
| POST     | /projects/:currentProjectId/move/:newProjectId/tasks/:taskId  | Move task between projects
| POST     | /projects//:projectId/tasks/:taskId                           | Assign task to a project 
| GET      | /projects?status=done                                         | Filter proejcts by status
| GET      | /projects?search=keyword                                      | Search proejcts by name
| GET      | /projects?order_by=startDate[DESC]                            |                                               |
|          |  &order_by=dueDate[ASC]                                       | Sort proejcts by start, due, or done dates    |



### Examples

  ```bash
   curl ---
   ```

#### CURL

Create a new project

```http
  
```

  ```bash
   
   ```

Get/List all projects
```http
   GET /api/v1/projects
```
```bash

```

| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |

sort  string   Optional. Sort projects by dates

curl -X GET "http://localhost:3000/api/v1/projects?sort=startDate[ASC]"



Edit an existing project
```http
  PUT /api/v1/projects/:id
```
```bash

```
| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |
| `id`             | `Project ID`| **Required**. Valid ObjectId                    |

name  string   Optional. Project name
description string   Optional. Project description
startDate   date  Optional. Date (YYYY-MM-DD)
dueDate  date  Optional. Date (YYYY-MM-DD)

Delete a task
```http
  DELETE /api/v1/projects/:id
```

```bash

```
| Parameter        | Type        | Description                                     |
| :--------------- | :---------- | :---------------------------------------------- |
| `id`             | `Project ID`| **Required**. Valid ObjectId                    |

curl -X DELETE http://localhost:3000/api/v1/projects/{id}


POST /api/v1/projects/:currentProjectId/move/:newProjectId/tasks/:taskId

POST /api/v1/projects/:projectId/tasks/:taskId


Assign a task to a project
```http
  POST /api/v1/projects/:projectId/tasks/:taskId
```
| Parameter        | Type          | Description                                     |
| :--------------- | :------------ | :---------------------------------------------- |
| `projectId`      | `Project ID`  | **Required**. Valid ObjectId                    |
| `taskId`         | `Task ID`     | **Required**. Valid ObjectId                    |

taskId   string   Required. Task ID

```bash
curl -X POST "http://localhost:3000/api/v1/projects/${projectId}/tasks/${taskId}" \
      -H "Content-Type: application/json"
 ```

Move a task between projects
```http
  POST /api/v1/projects/:currentProjectId/move/:newProjectId/tasks/:taskId
```
| Parameter            | Type           | Description                                     |
| :------------------- | :------------- | :---------------------------------------------- |
| `currentProjectId`   | `Project ID`   | **Required**. Valid ObjectId                    |
| `newProjectId`       | `Project ID`   | **Required**. Valid ObjectId                    |
| `taskId`             | `Task ID`      | **Required**. Valid ObjectId                    |

```bash
curl -X POST "http://localhost:3000/api/v1/projects/${currentProjectId}/move/${newProjectId}/tasks/${taskId}" \
      -H "Content-Type: application/json"
```


#### Postman Collection
[Postman Collection](./postman)



#### Swagger/OpenAPI
[Swagger Doc](http://localhost:3000/api-docs/)


## Test

All
```bash
   npm test
```
Task
```bash
   npx jest tests/taskRoutes.test.js
```
Project
```bash
   npx jest tests/projectRoutes.test.js
```


#### Schema

[projectSchema](./BONUS/db_schema)

[taskSchema](./BONUS/db_schema)


## Changelogs



## Roadmap / Milestones / Additional Features
TODO:
- User management (name, email, login(pass/oauth/etc))
- RBAC
- Addig user auth
- API Versioning
- Assign user as Project Owner
- Assign users to project
- Assign task to user
- Filter tasks by user
- Task prioritasition
- Notification
- Audit logs
- Reporting 
- Dashboard
- Fetch project with parameter 'include'. If keys are defined in includes, that case we send back the included field as an object e.g include=tasks, send back tasks[{fullObject}, {fullObject}] insteadof tasks[taskId1, taskId2], this way we can prevent extra subqueries from the client side if they need to show the task details in the project.
- etc....


## License

This project is licensed under the MIT License.


## Author
Created by XSAW | Bence Bozvary

