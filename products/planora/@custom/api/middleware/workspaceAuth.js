// products/planora/@custom/api/middleware/workspaceAuth.js
// Workspace membership verification middleware for IDOR protection
const { prisma } = require('../../db/client');

/**
 * Middleware: Verify the authenticated user is a member of the workspace
 * that owns the target project. Extracts workspaceId from:
 *   1. req.params.workspaceId (explicit route param)
 *   2. req.params.projectId → project.workspaceId (derived from project)
 *   3. req.params.id on project routes → project.workspaceId
 *
 * Sets req.workspaceId and req.workspaceMembership on success.
 */
const requireWorkspaceMember = async (req, res, next) => {
  try {
    let workspaceId = req.params.workspaceId;

    // If no explicit workspaceId, derive from project
    if (!workspaceId) {
      const projectId = req.params.projectId || req.params.id;
      if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { workspaceId: true }
        });
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        workspaceId = project.workspaceId;
      }
    }

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace context required' });
    }

    // Check workspace membership
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    req.workspaceId = workspaceId;
    req.workspaceMembership = membership;
    next();
  } catch (err) {
    console.error('Workspace auth error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Middleware: Verify workspace membership for task routes.
 * Derives workspace from task → project → workspace chain.
 */
const requireWorkspaceMemberForTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return next(); // Let downstream handle missing param
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        project: {
          select: { workspaceId: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const workspaceId = task.project.workspaceId;

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.userId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this workspace' });
    }

    req.workspaceId = workspaceId;
    req.workspaceMembership = membership;
    next();
  } catch (err) {
    console.error('Workspace auth error (task):', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requireWorkspaceMember, requireWorkspaceMemberForTask };
