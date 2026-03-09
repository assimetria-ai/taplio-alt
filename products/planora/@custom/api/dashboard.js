// products/planora/@custom/api/dashboard.js - Dashboard API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    // Get all projects user has access to
    const projectMemberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      select: { projectId: true }
    });

    const projectIds = projectMemberships.map(m => m.projectId);

    // Count total projects
    const totalProjects = projectIds.length;

    // Count total tasks in user's projects
    const totalTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds }
      }
    });

    // Count completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: 'done'
      }
    });

    // Count overdue tasks (not completed and past due date)
    const now = new Date();
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: 'done' },
        dueDate: { lt: now }
      }
    });

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        overdueTasks
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks assigned to current user
router.get('/dashboard/my-tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: req.userId,
        status: { not: 'done' } // Only show active tasks
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      take: 10 // Limit to 10 most relevant tasks
    });

    res.json({
      tasks: tasks.map(t => ({
        ...t,
        commentCount: t._count.comments
      }))
    });
  } catch (err) {
    console.error('Error fetching my tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity feed
router.get('/dashboard/activity', async (req, res) => {
  try {
    // Get all projects user has access to
    const projectMemberships = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      select: { projectId: true }
    });

    const projectIds = projectMemberships.map(m => m.projectId);

    // Fetch recent tasks (created/updated)
    const recentTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        },
        project: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Fetch recent comments
    const recentComments = await prisma.comment.findMany({
      where: {
        task: {
          projectId: { in: projectIds }
        }
      },
      include: {
        author: {
          select: { id: true, name: true }
        },
        task: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Combine and sort activities
    const activities = [];

    // Add task activities
    recentTasks.forEach(task => {
      const action = task.status === 'done' ? 'completed' : 'created';
      activities.push({
        type: task.status === 'done' ? 'task_completed' : 'task_created',
        user: task.createdBy,
        action: `${action} a task in ${task.project.name}`,
        target: task.title,
        targetLink: `/tasks/${task.id}`,
        timestamp: task.createdAt
      });
    });

    // Add comment activities
    recentComments.forEach(comment => {
      activities.push({
        type: 'comment_added',
        user: comment.author,
        action: 'commented on',
        target: comment.task.title,
        targetLink: `/tasks/${comment.task.id}`,
        timestamp: comment.createdAt
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, 10);

    res.json({
      activities: limitedActivities
    });
  } catch (err) {
    console.error('Error fetching activity feed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
