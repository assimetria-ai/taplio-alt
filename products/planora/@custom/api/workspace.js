// products/planora/@custom/api/workspace.js - Workspace settings API
const express = require('express');
const { prisma } = require('../db/client');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Helper: verify workspace ownership (workspace settings are user-scoped)
async function verifyWorkspaceOwnership(workspaceId, userId) {
  const workspace = await prisma.workspaceSettings.findUnique({
    where: { id: workspaceId }
  });
  if (!workspace) return null;
  if (workspace.userId !== userId) return false;
  return workspace;
}

// Get workspace settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    // User-level workspace settings — scoped to authenticated user
    let settings = await prisma.workspaceSettings.findFirst({
      where: { userId: req.userId }
    });

    // Create default settings if none exist
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

// Update workspace settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { name, timezone, dateFormat, timeFormat, weekStart } = req.body;

    // Find or create workspace settings — scoped to authenticated user
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
      // Update existing
      settings = await prisma.workspaceSettings.update({
        where: { id: settings.id },
        data
      });
    } else {
      // Create new
      settings = await prisma.workspaceSettings.create({
        data: {
          ...data,
          userId: req.userId
        }
      });
    }

    res.json({ settings, message: 'Workspace settings updated' });
  } catch (error) {
    console.error('Update workspace settings error:', error);
    res.status(500).json({ error: 'Failed to update workspace settings' });
  }
});

// Get workspace members (for team view)
// Authorization: only the workspace owner can list members
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const ownership = await verifyWorkspaceOwnership(req.params.id, req.userId);
    if (ownership === null) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    if (ownership === false) {
      return res.status(403).json({ error: 'Forbidden — you are not a member of this workspace' });
    }

    // Return workspace owner as the member (user-scoped workspace)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    res.json({ members: user ? [user] : [] });
  } catch (error) {
    console.error('Get workspace members error:', error);
    res.status(500).json({ error: 'Failed to fetch workspace members' });
  }
});

// Backward-compatible: GET /members returns current user's workspace members
router.get('/members', authenticateToken, async (req, res) => {
  try {
    // Scoped to authenticated user — only returns their own data
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    res.json({ members: user ? [user] : [] });
  } catch (error) {
    console.error('Get workspace members error:', error);
    res.status(500).json({ error: 'Failed to fetch workspace members' });
  }
});

// Invite member to workspace
// Authorization: only workspace owner (admin) can invite
router.post('/:id/invite', authenticateToken, async (req, res) => {
  try {
    const ownership = await verifyWorkspaceOwnership(req.params.id, req.userId);
    if (ownership === null) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    if (ownership === false) {
      return res.status(403).json({ error: 'Forbidden — only the workspace owner can invite members' });
    }

    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, member, or viewer' });
    }

    // TODO: Implement full workspace invitation flow (email, acceptance)
    // For now, return success message
    res.json({ 
      message: 'Invitation sent',
      invite: {
        email,
        role: role || 'member',
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Backward-compatible: POST /invite scoped to current user's workspace
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate role
    const validRoles = ['admin', 'member', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, member, or viewer' });
    }

    // Verify user has a workspace (must own one to invite)
    const workspace = await prisma.workspaceSettings.findFirst({
      where: { userId: req.userId }
    });

    if (!workspace) {
      return res.status(403).json({ error: 'You must create a workspace before inviting members' });
    }

    // TODO: Implement full workspace invitation flow (email, acceptance)
    res.json({ 
      message: 'Invitation sent',
      invite: {
        email,
        role: role || 'member',
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

module.exports = router;
