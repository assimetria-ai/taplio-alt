// products/planora/@custom/api/tasks.js - Tasks API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

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
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        projectId: req.params.projectId,
        createdById: req.userId,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || []
      },
      include: {
        assignee: {
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

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags
      },
      include: {
        assignee: {
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
