// products/planora/@custom/api/projects.js - Projects API
// SECURITY: All routes verify workspace membership (IDOR protection)
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');
const { requireWorkspaceMember } = require('./middleware/workspaceAuth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// List projects — scoped to workspaces the user belongs to
router.get('/', async (req, res) => {
  try {
    // Get all workspaces the user is a member of
    const workspaceMemberships = await prisma.workspaceMember.findMany({
      where: { userId: req.userId },
      select: { workspaceId: true }
    });
    const workspaceIds = workspaceMemberships.map(m => m.workspaceId);

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        members: {
          some: { userId: req.userId }
        }
      },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true }
        },
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

// Create project — requires workspace membership
router.post('/', async (req, res) => {
  try {
    const { name, description, color, workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId is required' });
    }

    // Verify workspace membership
    const wsMembership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.userId
        }
      }
    });

    if (!wsMembership) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        createdById: req.userId,
        workspaceId,
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
        },
        workspace: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    res.json({ project });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project — verify workspace membership + project membership
router.get('/:id', requireWorkspaceMember, async (req, res) => {
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
        },
        workspace: {
          select: { id: true, name: true, slug: true }
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

// Update project — verify workspace membership + admin/owner role
router.put('/:id', requireWorkspaceMember, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Verify user has admin/owner role in project
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
        },
        workspace: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    res.json({ project });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project — verify workspace membership + owner role
router.delete('/:id', requireWorkspaceMember, async (req, res) => {
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
