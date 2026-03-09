// products/planora/@custom/api/constants.js - API Constants

// Task statuses as per requirements: To Do, In Progress, Review, Stuck, Done
const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  STUCK: 'stuck',
  DONE: 'done'
};

const VALID_TASK_STATUSES = Object.values(TASK_STATUS);

// Task priorities
const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const VALID_TASK_PRIORITIES = Object.values(TASK_PRIORITY);

// Project member roles
const PROJECT_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

const VALID_PROJECT_ROLES = Object.values(PROJECT_ROLE);

module.exports = {
  TASK_STATUS,
  VALID_TASK_STATUSES,
  TASK_PRIORITY,
  VALID_TASK_PRIORITIES,
  PROJECT_ROLE,
  VALID_PROJECT_ROLES
};
