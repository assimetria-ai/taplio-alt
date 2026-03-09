// products/planora/@custom/api/tasks.js - Tasks API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');
const { 
  VALID_TASK_STATUSES, 
  VALID_TASK_PRIORITIES,
  TASK_STATUS,
  TASK_PRIORITY
} = require('./constants');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// List tasks for a project
router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    // Verify user has access to project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { comments: true, attachments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      tasks: tasks.map(t => ({
        ...t,
        commentCount: t._count.comments,
        attachmentCount: t._count.attachments
      }))
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/projects/:projectId/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, dueDate, tags } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    if (status && !VALID_TASK_STATUSES.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + VALID_TASK_STATUSES.join(', ')
      });
    }

    if (priority && !VALID_TASK_PRIORITIES.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority. Must be one of: ' + VALID_TASK_PRIORITIES.join(', ')
      });
    }

    // Verify user has access to project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || TASK_STATUS.TODO,
        priority: priority || TASK_PRIORITY.MEDIUM,
        projectId: req.params.projectId,
        createdById: req.userId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || []
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ task });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get task
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: req.userId }
            }
          }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, dueDate, tags } = req.body;

    // Validation
    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    if (status && !VALID_TASK_STATUSES.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + VALID_TASK_STATUSES.join(', ')
      });
    }

    if (priority && !VALID_TASK_PRIORITIES.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority. Must be one of: ' + VALID_TASK_PRIORITIES.join(', ')
      });
    }

    // Verify user has access
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: req.userId }
            }
          }
        }
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Build update data object (only update provided fields)
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ task: updated });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    // Verify user has access
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: req.userId }
            }
          }
        }
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to task
router.post('/tasks/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;

    // Verify user has access to task
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: req.userId }
            }
          }
        }
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: req.params.id,
        authorId: req.userId
      },
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ comment });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
