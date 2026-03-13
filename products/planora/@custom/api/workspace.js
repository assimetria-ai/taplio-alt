// products/planora/@custom/api/workspace.js - Workspace API
// SECURITY: All routes verify workspace membership (IDOR protection)
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth, authenticateToken } = require('./auth');

const router = express.Router();

// List workspaces the user belongs to
router.get('/', requireAuth, async (req, res) => {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true, projects: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      workspaces: memberships.map(m => ({
        ...m.workspace,
        role: m.role,
        memberCount: m.workspace._count.members,
        projectCount: m.workspace._count.projects
      }))
    });
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create workspace
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Workspace name is required' });
    }

    // Generate slug from name
    const slug = name.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug,
        members: {
          create: {
            userId: req.userId,
            role: 'owner'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.json({ workspace });
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get workspace settings — requires membership
router.get('/:workspaceId/settings', requireAuth, async (req, res) => {
  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.workspaceId,
          userId: req.userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.workspaceId },
      include: {
        _count: {
          select: { members: true, projects: true }
        }
      }
    });

    // Also fetch user-level workspace display settings
    let displaySettings = await prisma.workspaceSettings.findFirst({
      where: { userId: req.userId }
    });

    if (!displaySettings) {
      displaySettings = await prisma.workspaceSettings.create({
        data: {
          userId: req.userId,
          name: workspace?.name || 'My Workspace',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          weekStart: 'monday'
        }
      });
    }

    res.json({ workspace, displaySettings, userRole: membership.role });
  } catch (err) {
    console.error('Get workspace settings error:', err);
    res.status(500).json({ error: 'Failed to fetch workspace settings' });
  }
});

// Update workspace — requires admin/owner
router.put('/:workspaceId/settings', requireAuth, async (req, res) => {
  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.workspaceId,
          userId: req.userId
        }
      }
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, timezone, dateFormat, timeFormat, weekStart } = req.body;

    // Update workspace name if provided
    if (name) {
      await prisma.workspace.update({
        where: { id: req.params.workspaceId },
        data: { name: name.trim() }
      });
    }

    // Update user-level display settings
    let displaySettings = await prisma.workspaceSettings.findFirst({
      where: { userId: req.userId }
    });

    const data = {
      name: name || displaySettings?.name || 'My Workspace',
      timezone: timezone || displaySettings?.timezone || 'UTC',
      dateFormat: dateFormat || displaySettings?.dateFormat || 'MM/DD/YYYY',
      timeFormat: timeFormat || displaySettings?.timeFormat || '12h',
      weekStart: weekStart || displaySettings?.weekStart || 'monday'
    };

    if (displaySettings) {
      displaySettings = await prisma.workspaceSettings.update({
        where: { id: displaySettings.id },
        data
      });
    } else {
      displaySettings = await prisma.workspaceSettings.create({
        data: { ...data, userId: req.userId }
      });
    }

    res.json({ displaySettings, message: 'Workspace settings updated' });
  } catch (err) {
    console.error('Update workspace settings error:', err);
    res.status(500).json({ error: 'Failed to update workspace settings' });
  }
});

// Get workspace members — requires membership
router.get('/:workspaceId/members', requireAuth, async (req, res) => {
  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.workspaceId,
          userId: req.userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: req.params.workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ members });
  } catch (err) {
    console.error('Get workspace members error:', err);
    res.status(500).json({ error: 'Failed to fetch workspace members' });
  }
});

// Invite member to workspace — requires admin/owner
router.post('/:workspaceId/invite', requireAuth, async (req, res) => {
  try {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.workspaceId,
          userId: req.userId
        }
      }
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found. They need to sign up first.' });
    }

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: req.params.workspaceId,
          userId: invitedUser.id
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'User is already a workspace member' });
    }

    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId: req.params.workspaceId,
        userId: invitedUser.id,
        role: role || 'member'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ member: newMember, message: 'Member added to workspace' });
  } catch (err) {
    console.error('Invite member error:', err);
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// Backward compat: old /settings endpoint redirects to workspace-scoped
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    let settings = await prisma.workspaceSettings.findFirst({
      where: { userId: req.userId }
    });

    if (!settings) {
      settings = await prisma.workspaceSettings.create({
        data: {
          userId: req.userId,
          name: 'My Workspace',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          weekStart: 'monday'
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get workspace settings error:', error);
    res.status(500).json({ error: 'Failed to fetch workspace settings' });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { name, timezone, dateFormat, timeFormat, weekStart } = req.body;

    let settings = await prisma.workspaceSettings.findFirst({
      where: { userId: req.userId }
    });

    const data = {
      name: name || 'My Workspace',
      timezone: timezone || 'UTC',
      dateFormat: dateFormat || 'MM/DD/YYYY',
      timeFormat: timeFormat || '12h',
      weekStart: weekStart || 'monday'
    };

    if (settings) {
      settings = await prisma.workspaceSettings.update({
        where: { id: settings.id },
        data
      });
    } else {
      settings = await prisma.workspaceSettings.create({
        data: { ...data, userId: req.userId }
      });
    }

    res.json({ settings, message: 'Workspace settings updated' });
  } catch (error) {
    console.error('Update workspace settings error:', error);
    res.status(500).json({ error: 'Failed to update workspace settings' });
  }
});

module.exports = router;
