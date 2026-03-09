# Task Management API Testing Guide

## Overview
This document demonstrates how to test the Task Management CRUD operations for Planora.

## API Endpoints

### 1. CREATE Task
**POST** `/api/projects/:projectId/tasks`

**Required Fields:**
- `title` (string, required)

**Optional Fields:**
- `description` (string)
- `status` (string): `todo`, `in-progress`, `review`, `stuck`, `done` (default: `todo`)
- `priority` (string): `low`, `medium`, `high`, `urgent` (default: `medium`)
- `assigneeId` (string, user ID)
- `dueDate` (ISO 8601 date string)
- `tags` (array of strings)

**Example Request:**
```json
POST /api/projects/clx1234/tasks
{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth with email/password",
  "status": "in-progress",
  "priority": "high",
  "assigneeId": "user_abc123",
  "dueDate": "2024-03-20T00:00:00Z",
  "tags": ["backend", "security"]
}
```

**Example Response:**
```json
{
  "task": {
    "id": "clx5678",
    "title": "Implement user authentication",
    "description": "Add JWT-based auth with email/password",
    "status": "in-progress",
    "priority": "high",
    "projectId": "clx1234",
    "assigneeId": "user_abc123",
    "createdById": "user_xyz",
    "dueDate": "2024-03-20T00:00:00.000Z",
    "tags": ["backend", "security"],
    "createdAt": "2024-03-09T16:00:00.000Z",
    "updatedAt": "2024-03-09T16:00:00.000Z",
    "assignee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 2. READ Task (Single)
**GET** `/api/tasks/:id`

**Example Request:**
```
GET /api/tasks/clx5678
```

**Example Response:**
```json
{
  "task": {
    "id": "clx5678",
    "title": "Implement user authentication",
    "description": "Add JWT-based auth with email/password",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2024-03-20T00:00:00.000Z",
    "assignee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "comments": [],
    "attachments": []
  }
}
```

---

### 3. READ Tasks (List)
**GET** `/api/projects/:projectId/tasks`

**Example Request:**
```
GET /api/projects/clx1234/tasks
```

**Example Response:**
```json
{
  "tasks": [
    {
      "id": "clx5678",
      "title": "Implement user authentication",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2024-03-20T00:00:00.000Z",
      "commentCount": 3,
      "attachmentCount": 1
    },
    {
      "id": "clx9012",
      "title": "Design landing page",
      "status": "review",
      "priority": "medium",
      "dueDate": null,
      "commentCount": 0,
      "attachmentCount": 0
    }
  ]
}
```

---

### 4. UPDATE Task
**PUT** `/api/tasks/:id`

**Updatable Fields:**
- `title` (string)
- `description` (string)
- `status` (string): `todo`, `in-progress`, `review`, `stuck`, `done`
- `priority` (string): `low`, `medium`, `high`, `urgent`
- `assigneeId` (string)
- `dueDate` (ISO 8601 date string)
- `tags` (array of strings)

**Example Request:**
```json
PUT /api/tasks/clx5678
{
  "status": "stuck",
  "priority": "urgent",
  "description": "Blocked by OAuth provider setup"
}
```

**Example Response:**
```json
{
  "task": {
    "id": "clx5678",
    "title": "Implement user authentication",
    "description": "Blocked by OAuth provider setup",
    "status": "stuck",
    "priority": "urgent",
    "dueDate": "2024-03-20T00:00:00.000Z",
    "assignee": {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

### 5. DELETE Task
**DELETE** `/api/tasks/:id`

**Example Request:**
```
DELETE /api/tasks/clx5678
```

**Example Response:**
```json
{
  "message": "Task deleted"
}
```

---

## Status Values

As per requirements, the following statuses are supported:

1. **todo** - To Do (default)
2. **in-progress** - In Progress
3. **review** - Review
4. **stuck** - Stuck
5. **done** - Done

## Priority Values

The following priorities are supported:

1. **low** - Low priority
2. **medium** - Medium priority (default)
3. **high** - High priority
4. **urgent** - Urgent

## Validation Rules

1. **Title** is required and cannot be empty
2. **Status** must be one of the valid status values
3. **Priority** must be one of the valid priority values
4. **Due Date** must be a valid ISO 8601 date string
5. User must be a member of the project to create/update/delete tasks
6. Only project members can view tasks

## Error Responses

### 400 Bad Request
```json
{
  "error": "Task title is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Task not found"
}
```

### 500 Server Error
```json
{
  "error": "Server error"
}
```

---

## cURL Examples

### Create Task
```bash
curl -X POST http://localhost:3000/api/projects/clx1234/tasks \
  -H "Content-Type: application/json" \
  -b "token=your_jwt_token" \
  -d '{
    "title": "Fix login bug",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-03-15T00:00:00Z"
  }'
```

### Update Task Status
```bash
curl -X PUT http://localhost:3000/api/tasks/clx5678 \
  -H "Content-Type: application/json" \
  -b "token=your_jwt_token" \
  -d '{
    "status": "done"
  }'
```

### List All Tasks
```bash
curl -X GET http://localhost:3000/api/projects/clx1234/tasks \
  -b "token=your_jwt_token"
```

### Delete Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/clx5678 \
  -b "token=your_jwt_token"
```

---

## Implementation Status

✅ **COMPLETE** - All CRUD operations implemented with:
- Create task with status, priority, and due date
- Read single task and list tasks
- Update task (all fields including status, priority, due date)
- Delete task
- Proper validation for status and priority
- Authorization checks (project membership required)
- Support for all 5 required status values: To Do, In Progress, Review, Stuck, Done
