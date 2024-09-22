// 1. Write a mongo aggregation that returns all the projects that have a task with a due date set to “today”
const today = new Date()
const formattedToday = today.toISOString().split('T')[0];

// Run the aggregation pipeline
this.proejctCollection.aggregate([
  { $lookup: { from: 'tasks', localField: 'tasks', foreignField: '_id', as: 'taskInfo' } },
  { $match: { 'taskInfo.dueDate': formattedToday } }
]).toArray().then((result) => {
  console.log('Tasks due today:', result);
});


// 2. Write a mongo aggregation that returns all the tasks that have a project with a due date set to “today”
const aggregationProject = [
  { $lookup: { from: 'projects', localField: '_id', foreignField: 'tasks', as: 'projectInfo' } },
  { $match: { 'projectInfo.dueDate': formattedToday } }
];

// Run the aggregation pipeline
this.taskCollection.aggregate(aggregationProject).toArray().then((result) => {
  console.log('Tasks due today:', result);
});

