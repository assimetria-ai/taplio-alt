// products/planora/@custom/api/search.js - Global Search API
// SECURITY: All queries scoped through workspace membership (IDOR protection)
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * Helper: Get project IDs the user can access via workspace + project membership.
 */
async function getAccessibleProjectIds(userId) {
  const workspaceMemberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true }
  });
  const workspaceIds = workspaceMemberships.map(m => m.workspaceId);

  const projectMemberships = await prisma.projectMember.findMany({
    where: {
      userId,
      project: {
        workspaceId: { in: workspaceIds }
      }
    },
    select: { projectId: true }
  });

  return projectMemberships.map(m => m.projectId);
}

// Global search endpoint — scoped to workspace-accessible projects
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

    const projectIds = await getAccessibleProjectIds(req.userId);

    // Search tasks
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

    // Search projects
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

    // Search team members (within accessible projects)
    if (!type || type === 'members') {
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

    // If projectId given, verify access via workspace + project membership
    if (projectId) {
      const projectIds = await getAccessibleProjectIds(req.userId);
      if (!projectIds.includes(projectId)) {
        return res.status(403).json({ error: 'Not authorized for this project' });
      }
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
