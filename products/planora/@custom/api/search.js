// products/planora/@custom/api/search.js - Global Search API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Global search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const searchTerm = q.trim();
    const results = {
      tasks: [],
      projects: [],
      members: []
    };

    // Get user's accessible projects
    const userProjects = await prisma.projectMember.findMany({
      where: { userId: req.userId },
      select: { projectId: true }
    });

    const projectIds = userProjects.map(p => p.projectId);

    // Search tasks (if no type filter or type is 'tasks')
    if (!type || type === 'tasks') {
      results.tasks = await prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          project: {
            select: { id: true, name: true }
          },
          assignee: {
            select: { id: true, name: true }
          }
        },
        take: 10,
        orderBy: { updatedAt: 'desc' }
      });
    }

    // Search projects (if no type filter or type is 'projects')
    if (!type || type === 'projects') {
      results.projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds },
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { tasks: true, members: true }
          }
        },
        take: 10,
        orderBy: { updatedAt: 'desc' }
      });
    }

    // Search team members (if no type filter or type is 'members')
    if (!type || type === 'members') {
      // Get members from user's projects
      const members = await prisma.projectMember.findMany({
        where: {
          projectId: { in: projectIds },
          user: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true }
          }
        },
        distinct: ['userId'],
        take: 10
      });

      results.members = members.map(m => ({
        ...m.user,
        projects: [m.project]
      }));
    }

    res.json({ results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get saved filters for a user
router.get('/filters', async (req, res) => {
  try {
    const filters = await prisma.savedFilter.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ filters });
  } catch (err) {
    console.error('Error fetching filters:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a new filter
router.post('/filters', async (req, res) => {
  try {
    const { name, filterData, projectId } = req.body;

    if (!name || !filterData) {
      return res.status(400).json({ error: 'Name and filter data required' });
    }

    const filter = await prisma.savedFilter.create({
      data: {
        name,
        filterData,
        projectId,
        userId: req.userId
      }
    });

    res.json({ filter });
  } catch (err) {
    console.error('Error saving filter:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a saved filter
router.delete('/filters/:id', async (req, res) => {
  try {
    // Verify ownership
    const filter = await prisma.savedFilter.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!filter) {
      return res.status(404).json({ error: 'Filter not found' });
    }

    await prisma.savedFilter.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Filter deleted' });
  } catch (err) {
    console.error('Error deleting filter:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
