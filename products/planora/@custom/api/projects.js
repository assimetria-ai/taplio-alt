// products/planora/@custom/api/projects.js - Projects API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// List projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId: req.userId }
        }
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      projects: projects.map(p => ({
        ...p,
        taskCount: p._count.tasks
      }))
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        createdById: req.userId,
        members: {
          create: {
            userId: req.userId,
            role: 'owner'
          }
        }
      },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    res.json({ project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        members: {
          some: { userId: req.userId }
        }
      },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Verify user has access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.id,
        userId: req.userId,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, color },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    res.json({ project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    // Verify user is owner
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.id,
        userId: req.userId,
        role: 'owner'
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
