// products/planora/@custom/api/workspace.js - Workspace settings API
const express = require('express');
const { prisma } = require('../db/client');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get workspace settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    // For now, we'll use user-level workspace settings
    // In a multi-workspace app, you'd look up based on workspace ID
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

    // Find or create workspace settings
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
router.get('/members', authenticateToken, async (req, res) => {
  try {
    // In a full implementation, this would query workspace members
    // For now, just return the current user
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

// Invite member (placeholder)
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // TODO: Implement workspace invitations
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

module.exports = router;
