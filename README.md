# Tasks & Projects API

## Overview

The project is a "Simple Tasks & Projects API" developed using Node.js, ExpressJs and MongoDB. 
The API allows you to manage tasks and projects, including features like creating, editing, deleting, and filtering tasks and projects, as well as assigning tasks to projects.


### Key Features:
- Create, list, edit, delete tasks and projects
- Mark tasks as "to-do"/"done."
- Filter tasks by status/projectName
- Sort tasks by dates (start, due, done)
- Sort projects by dates (start, due)
- Assign tasks to projects
- Search tasks by name using Regex


## Installation

### Prerequisites
- **Node.js**: Install from [here](https://nodejs.org/).
- **MongoDB**: Download and install MongoDB locally from Docker Image[here](https://hub.docker.com/_/mongo).
	
	```
	docker run -d --network mongo-network --name mongo-db \
	-e MONGO_INITDB_DATABASE=todoList \
	-p 27017:27017 \
	mongo
	```

	```
	$ docker run --network mongo-network -e ME_CONFIG_MONGODB_SERVER=mongo-db -p 8081:8081 mongo-express
	```


### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bozvary/todo-interview.git
   cd todo-interview
   npm install
   ```

2. Create a .env file inn the root folder, or use sample.env 
	```bash
   touch .env #create
   cp sample.env .env #copy the sample
   ```


3. Run
	```bash
   npm run dev
   ```

## API Endpoints

Check SWAGGER API for more details

### Tasks Endpoints
Method		Endpoint								Description

POST			/{v}/api/tasks							Create a new task
GET				/{v}/api/tasks							Get/List all tasks
PUT				/{v}/api/tasks/:id					Edit an existing task
DELETE		/{v}/api/tasks/:id					Delete a task
PATCH			/{v}/api/tasks/:id/status		Mark a task as to-do/done
GET				/{v}/api/tasks?status=done	Filter tasks by status
GET				/{v}/api/tasks?search=name	Search tasks by name
GET				/{v}/api/tasks?sort=date		Sort tasks by start, due, or done dates


### Projects Endpoints
TODO:
Method		Endpoint								Description


### Examples

  ```bash
   curl ---
   ```

#### CURL


Create a new task

  ```bash
   curl -X POST http://localhost:3000/api/tasks \
		-H "Content-Type: application/json" \
		-d '{
		  "name": "Create containers",
		  "description": "Create MongoDb and Mongo UI containers",
		  "status": "to-do",
		  "startDate": "2024-09-22",
		  "dueDate": "2024-09-23"
		}'
   ```

Get/List all tasks
   ```bash

   ```

Edit an existing task
   ```bash

   ```

Delete a task
   ```bash

   ```

Mark a task as to-do/done
   ```bash

   ```

Filter tasks by status
   ```bash

   ```

Search tasks by name
   ```bash

   ```

Sort tasks by start, due, or done dates
   ```bash

   ```

#### Postman Collection
TODO:

#### Swagger/OpenAPI
TODO:


## Test
TODO:


## Changelogs
TODO:

## Roadmap / Milestones / Additional Features
TODO:
User management (name, email, login(pass/oauth/etc))
RBAC
Addig user auth
API Versioning
Assign user as Project Owner
Assign users to project
Assign task to user
Filter tasks by user
Task prioritasition
Notification
Audit logs
Reporting 
Dashboard
etc....


## License

This project is licensed under the MIT License.


## Author
Created by XSAW | Bence Bozvary

