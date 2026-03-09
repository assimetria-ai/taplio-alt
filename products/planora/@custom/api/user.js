// products/planora/@custom/api/user.js - User settings and preferences API
const express = require('express');
const bcrypt = require('bcrypt');
const { prisma } = require('../db/client');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};

    // Update basic info
    if (name && name !== user.name) {
      updates.name = name;
    }

    if (email && email !== user.email) {
      // Check if email is already taken
      const existing = await prisma.user.findUnique({
        where: { email }
      });

      if (existing && existing.id !== req.userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      updates.email = email;
      updates.emailVerified = false; // Require re-verification
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    // Perform update
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get notification settings
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.userId }
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: req.userId,
          emailNotifications: true,
          taskAssigned: true,
          taskCompleted: true,
          taskComments: true,
          projectInvites: true,
          weeklyDigest: true,
          pushNotifications: false,
          browserNotifications: true
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/notifications', authenticateToken, async (req, res) => {
  try {
    const {
      emailNotifications,
      taskAssigned,
      taskCompleted,
      taskComments,
      projectInvites,
      weeklyDigest,
      pushNotifications,
      browserNotifications
    } = req.body;

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        emailNotifications: emailNotifications ?? true,
        taskAssigned: taskAssigned ?? true,
        taskCompleted: taskCompleted ?? true,
        taskComments: taskComments ?? true,
        projectInvites: projectInvites ?? true,
        weeklyDigest: weeklyDigest ?? true,
        pushNotifications: pushNotifications ?? false,
        browserNotifications: browserNotifications ?? true
      },
      update: {
        emailNotifications,
        taskAssigned,
        taskCompleted,
        taskComments,
        projectInvites,
        weeklyDigest,
        pushNotifications,
        browserNotifications
      }
    });

    res.json({ settings, message: 'Notification settings updated' });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete user (cascade will handle related records based on schema)
    await prisma.user.delete({
      where: { id: req.userId }
    });

    // Clear cookie
    res.clearCookie('token');

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
