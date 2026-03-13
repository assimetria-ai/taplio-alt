// products/planora/@custom/api/time-tracking.js - Time Tracking API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Start a timer for a task
router.post('/tasks/:taskId/time/start', async (req, res) => {
  try {
    const { description, billable } = req.body;

    // Verify user has access to the task
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: {
        project: {
          include: {
            members: { where: { userId: req.userId } }
          }
        }
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user already has a running timer
    const runningEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: req.userId,
        endTime: null
      }
    });

    if (runningEntry) {
      return res.status(400).json({ 
        error: 'You already have a running timer. Stop it first.',
        runningEntry
      });
    }

    const entry = await prisma.timeEntry.create({
      data: {
        startTime: new Date(),
        description: description?.trim() || null,
        billable: billable || false,
        taskId: req.params.taskId,
        userId: req.userId,
        projectId: task.projectId
      },
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.json({ timeEntry: entry });
  } catch (err) {
    console.error('Error starting timer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stop a running timer
router.post('/time/:entryId/stop', async (req, res) => {
  try {
    const entry = await prisma.timeEntry.findUnique({
      where: { id: req.params.entryId }
    });

    if (!entry || entry.userId !== req.userId) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    if (entry.endTime) {
      return res.status(400).json({ error: 'Timer already stopped' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - entry.startTime) / 1000);

    const updated = await prisma.timeEntry.update({
      where: { id: req.params.entryId },
      data: {
        endTime,
        duration
      },
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.json({ timeEntry: updated });
  } catch (err) {
    console.error('Error stopping timer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Pause a timer (stop without marking complete context — same as stop, semantically)
// Implemented as stop + ability to start a new one
router.post('/time/:entryId/pause', async (req, res) => {
  try {
    const entry = await prisma.timeEntry.findUnique({
      where: { id: req.params.entryId }
    });

    if (!entry || entry.userId !== req.userId) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    if (entry.endTime) {
      return res.status(400).json({ error: 'Timer already stopped' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - entry.startTime) / 1000);

    const updated = await prisma.timeEntry.update({
      where: { id: req.params.entryId },
      data: { endTime, duration },
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.json({ timeEntry: updated, paused: true });
  } catch (err) {
    console.error('Error pausing timer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current running timer for user
router.get('/time/current', async (req, res) => {
  try {
    const entry = await prisma.timeEntry.findFirst({
      where: {
        userId: req.userId,
        endTime: null
      },
      include: {
        task: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.json({ timeEntry: entry });
  } catch (err) {
    console.error('Error fetching current timer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a manual time entry
router.post('/tasks/:taskId/time', async (req, res) => {
  try {
    const { description, startTime, endTime, duration, billable } = req.body;

    if (!startTime) {
      return res.status(400).json({ error: 'startTime is required' });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: {
        project: {
          include: {
            members: { where: { userId: req.userId } }
          }
        }
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const dur = duration || (end ? Math.round((end - start) / 1000) : null);

    const entry = await prisma.timeEntry.create({
      data: {
        startTime: start,
        endTime: end,
        duration: dur,
        description: description?.trim() || null,
        billable: billable || false,
        taskId: req.params.taskId,
        userId: req.userId,
        projectId: task.projectId
      },
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.json({ timeEntry: entry });
  } catch (err) {
    console.error('Error creating time entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List time entries for a task
router.get('/tasks/:taskId/time', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: {
        project: {
          include: {
            members: { where: { userId: req.userId } }
          }
        }
      }
    });

    if (!task || task.project.members.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const entries = await prisma.timeEntry.findMany({
      where: { taskId: req.params.taskId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

    res.json({ timeEntries: entries, totalSeconds });
  } catch (err) {
    console.error('Error fetching time entries:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a time entry
router.put('/time/:entryId', async (req, res) => {
  try {
    const { description, startTime, endTime, billable } = req.body;

    const entry = await prisma.timeEntry.findUnique({
      where: { id: req.params.entryId }
    });

    if (!entry || entry.userId !== req.userId) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (billable !== undefined) updateData.billable = billable;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) {
      updateData.endTime = new Date(endTime);
      const start = startTime ? new Date(startTime) : entry.startTime;
      updateData.duration = Math.round((updateData.endTime - start) / 1000);
    }

    const updated = await prisma.timeEntry.update({
      where: { id: req.params.entryId },
      data: updateData,
      include: {
        task: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    res.json({ timeEntry: updated });
  } catch (err) {
    console.error('Error updating time entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a time entry
router.delete('/time/:entryId', async (req, res) => {
  try {
    const entry = await prisma.timeEntry.findUnique({
      where: { id: req.params.entryId }
    });

    if (!entry || entry.userId !== req.userId) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    await prisma.timeEntry.delete({
      where: { id: req.params.entryId }
    });

    res.json({ message: 'Time entry deleted' });
  } catch (err) {
    console.error('Error deleting time entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Time reports: per task, per user, per project
router.get('/projects/:projectId/time-report', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    // Verify access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const where = { projectId: req.params.projectId };
    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) {
      where.startTime = {
        ...where.startTime,
        lte: new Date(endDate)
      };
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: { select: { id: true, title: true, status: true } },
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    // Calculate summaries
    const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
    const billableSeconds = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0);

    // Group by user
    const byUser = {};
    entries.forEach(e => {
      if (!byUser[e.userId]) {
        byUser[e.userId] = { user: e.user, totalSeconds: 0, billableSeconds: 0, entries: 0 };
      }
      byUser[e.userId].totalSeconds += e.duration || 0;
      if (e.billable) byUser[e.userId].billableSeconds += e.duration || 0;
      byUser[e.userId].entries += 1;
    });

    // Group by task
    const byTask = {};
    entries.forEach(e => {
      if (!byTask[e.taskId]) {
        byTask[e.taskId] = { task: e.task, totalSeconds: 0, billableSeconds: 0, entries: 0 };
      }
      byTask[e.taskId].totalSeconds += e.duration || 0;
      if (e.billable) byTask[e.taskId].billableSeconds += e.duration || 0;
      byTask[e.taskId].entries += 1;
    });

    res.json({
      summary: {
        totalSeconds,
        billableSeconds,
        totalEntries: entries.length
      },
      byUser: Object.values(byUser),
      byTask: Object.values(byTask),
      entries
    });
  } catch (err) {
    console.error('Error generating time report:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export time report as CSV
router.get('/projects/:projectId/time-report/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const where = { projectId: req.params.projectId };
    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) {
      where.startTime = {
        ...where.startTime,
        lte: new Date(endDate)
      };
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: { select: { title: true } },
        user: { select: { name: true, email: true } },
        project: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    // Build CSV
    const headers = 'Date,Task,User,Description,Start,End,Duration (h),Billable\n';
    const rows = entries.map(e => {
      const hours = e.duration ? (e.duration / 3600).toFixed(2) : '0.00';
      const date = e.startTime.toISOString().split('T')[0];
      const start = e.startTime.toISOString();
      const end = e.endTime ? e.endTime.toISOString() : 'Running';
      const desc = (e.description || '').replace(/"/g, '""');
      return `${date},"${e.task.title}","${e.user.name}","${desc}",${start},${end},${hours},${e.billable}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=time-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(headers + rows);
  } catch (err) {
    console.error('Error exporting time report:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
