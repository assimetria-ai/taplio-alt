// products/planora/@custom/api/team.js - Team & Workspace API
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get team members for a project
router.get('/projects/:projectId/members', async (req, res) => {
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

    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ members });
  } catch (err) {
    console.error('Error fetching team members:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invite member to project
router.post('/projects/:projectId/members', async (req, res) => {
  try {
    const { email, role } = req.body;

    // Verify user has admin access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    // Check if user exists
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found. They need to sign up first.' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.projectId,
          userId: invitedUser.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    const newMember = await prisma.projectMember.create({
      data: {
        projectId: req.params.projectId,
        userId: invitedUser.id,
        role: role || 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'member_added',
        details: {
          memberName: invitedUser.name,
          memberEmail: invitedUser.email,
          role: role || 'member'
        },
        userId: req.userId,
        projectId: req.params.projectId
      }
    });

    res.json({ member: newMember });
  } catch (err) {
    console.error('Error adding team member:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update member role
router.put('/projects/:projectId/members/:memberId', async (req, res) => {
  try {
    const { role } = req.body;

    // Verify user has admin access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    // Get the member to update
    const memberToUpdate = await prisma.projectMember.findUnique({
      where: { id: req.params.memberId },
      include: { user: true }
    });

    if (!memberToUpdate || memberToUpdate.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Prevent changing owner role (only one owner allowed)
    if (memberToUpdate.role === 'owner') {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    // Update role
    const updatedMember = await prisma.projectMember.update({
      where: { id: req.params.memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'member_role_updated',
        details: {
          memberName: memberToUpdate.user.name,
          oldRole: memberToUpdate.role,
          newRole: role
        },
        userId: req.userId,
        projectId: req.params.projectId
      }
    });

    res.json({ member: updatedMember });
  } catch (err) {
    console.error('Error updating member role:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from project
router.delete('/projects/:projectId/members/:memberId', async (req, res) => {
  try {
    // Verify user has admin access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    // Get the member to remove
    const memberToRemove = await prisma.projectMember.findUnique({
      where: { id: req.params.memberId },
      include: { user: true }
    });

    if (!memberToRemove || memberToRemove.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Prevent removing owner
    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }

    // Remove member
    await prisma.projectMember.delete({
      where: { id: req.params.memberId }
    });

    // Unassign all tasks from this user in this project
    await prisma.task.updateMany({
      where: {
        projectId: req.params.projectId,
        assigneeId: memberToRemove.userId
      },
      data: { assigneeId: null }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'member_removed',
        details: {
          memberName: memberToRemove.user.name,
          memberEmail: memberToRemove.user.email,
          role: memberToRemove.role
        },
        userId: req.userId,
        projectId: req.params.projectId
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project/workspace settings
router.get('/projects/:projectId/settings', async (req, res) => {
  try {
    // Verify user has access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      }
    });

    res.json({ 
      project,
      userRole: membership.role 
    });
  } catch (err) {
    console.error('Error fetching project settings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update workspace settings
router.put('/projects/:projectId/settings', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Verify user has admin access
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: req.params.projectId,
        userId: req.userId,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.projectId },
      data: { name, description, color }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'workspace_updated',
        details: { name, description, color },
        userId: req.userId,
        projectId: req.params.projectId
      }
    });

    res.json({ project: updated });
  } catch (err) {
    console.error('Error updating workspace settings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
