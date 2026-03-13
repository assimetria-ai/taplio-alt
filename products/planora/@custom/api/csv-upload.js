// products/planora/@custom/api/csv-upload.js - CSV Bulk Upload for Tasks
const express = require('express');
const { prisma } = require('../db/client');
const { requireAuth } = require('./auth');
const {
  VALID_TASK_STATUSES,
  VALID_TASK_PRIORITIES,
  TASK_STATUS,
  TASK_PRIORITY
} = require('./constants');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Parse CSV text into rows (handles quoted fields, commas inside quotes, newlines)
function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const lines = [];

  // Split into lines respecting quoted newlines
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.trim()) lines.push(current);
      current = '';
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  for (const line of lines) {
    const fields = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = !quoted;
        }
      } else if (ch === ',' && !quoted) {
        fields.push(field.trim());
        field = '';
      } else {
        field += ch;
      }
    }
    fields.push(field.trim());
    rows.push(fields);
  }

  return rows;
}

// Normalize header names to expected field names
function normalizeHeader(header) {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  const map = {
    'title': 'title',
    'name': 'title',
    'taskname': 'title',
    'tasktitle': 'title',
    'description': 'description',
    'desc': 'description',
    'status': 'status',
    'priority': 'priority',
    'duedate': 'dueDate',
    'due': 'dueDate',
    'deadline': 'dueDate',
    'tags': 'tags',
    'labels': 'tags',
    'assignee': 'assigneeEmail',
    'assigneeemail': 'assigneeEmail',
    'assigned': 'assigneeEmail',
    'assignedto': 'assigneeEmail'
  };
  return map[h] || null;
}

// Validate a single row and return normalized data + errors
function validateRow(row, rowIndex, projectMembers) {
  const errors = [];
  const data = {};

  // Title is required
  if (!row.title || !row.title.trim()) {
    errors.push(`Row ${rowIndex}: Title is required`);
  } else {
    data.title = row.title.trim();
  }

  // Description (optional)
  data.description = row.description ? row.description.trim() : null;

  // Status (optional, default to 'todo')
  if (row.status) {
    const status = row.status.toLowerCase().trim();
    if (VALID_TASK_STATUSES.includes(status)) {
      data.status = status;
    } else {
      // Try common aliases
      const statusMap = {
        'to do': 'todo', 'to-do': 'todo', 'new': 'todo', 'open': 'todo',
        'in progress': 'in-progress', 'inprogress': 'in-progress', 'wip': 'in-progress', 'doing': 'in-progress',
        'in review': 'review', 'reviewing': 'review',
        'blocked': 'stuck',
        'completed': 'done', 'closed': 'done', 'finished': 'done'
      };
      data.status = statusMap[status] || null;
      if (!data.status) {
        errors.push(`Row ${rowIndex}: Invalid status "${row.status}". Valid: ${VALID_TASK_STATUSES.join(', ')}`);
        data.status = TASK_STATUS.TODO;
      }
    }
  } else {
    data.status = TASK_STATUS.TODO;
  }

  // Priority (optional, default to 'medium')
  if (row.priority) {
    const priority = row.priority.toLowerCase().trim();
    if (VALID_TASK_PRIORITIES.includes(priority)) {
      data.priority = priority;
    } else {
      const priorityMap = {
        'p1': 'urgent', 'critical': 'urgent', 'highest': 'urgent',
        'p2': 'high', 'important': 'high',
        'p3': 'medium', 'normal': 'medium', 'default': 'medium',
        'p4': 'low', 'minor': 'low', 'lowest': 'low'
      };
      data.priority = priorityMap[priority] || null;
      if (!data.priority) {
        errors.push(`Row ${rowIndex}: Invalid priority "${row.priority}". Valid: ${VALID_TASK_PRIORITIES.join(', ')}`);
        data.priority = TASK_PRIORITY.MEDIUM;
      }
    }
  } else {
    data.priority = TASK_PRIORITY.MEDIUM;
  }

  // Due date (optional)
  if (row.dueDate) {
    const parsed = new Date(row.dueDate.trim());
    if (isNaN(parsed.getTime())) {
      errors.push(`Row ${rowIndex}: Invalid date "${row.dueDate}". Use YYYY-MM-DD format.`);
    } else {
      data.dueDate = parsed;
    }
  }

  // Tags (optional, comma or semicolon separated)
  if (row.tags) {
    data.tags = row.tags.split(/[;|]/).map(t => t.trim()).filter(Boolean);
  } else {
    data.tags = [];
  }

  // Assignee email (optional)
  if (row.assigneeEmail) {
    const email = row.assigneeEmail.trim().toLowerCase();
    const member = projectMembers.find(m => m.user.email.toLowerCase() === email);
    if (member) {
      data.assigneeId = member.userId;
    } else {
      errors.push(`Row ${rowIndex}: Assignee "${row.assigneeEmail}" is not a project member`);
    }
  }

  return { data, errors };
}

// POST /api/csv-upload/preview/:projectId - Parse CSV and return preview
router.post('/preview/:projectId', express.text({ type: '*/*', limit: '5mb' }), async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user has access to project
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.userId }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const csvText = req.body;
    if (!csvText || !csvText.trim()) {
      return res.status(400).json({ error: 'Empty CSV data' });
    }

    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });
    }

    // Parse headers
    const headers = rows[0];
    const headerMap = {};
    const unmappedHeaders = [];
    headers.forEach((h, i) => {
      const normalized = normalizeHeader(h);
      if (normalized) {
        headerMap[i] = normalized;
      } else {
        unmappedHeaders.push(h);
      }
    });

    if (!Object.values(headerMap).includes('title')) {
      return res.status(400).json({
        error: 'CSV must have a "title" or "name" column',
        detectedHeaders: headers
      });
    }

    // Get project members for assignee validation
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true, name: true } } }
    });

    // Parse data rows
    const allErrors = [];
    const previewRows = [];

    for (let i = 1; i < rows.length; i++) {
      const rawRow = {};
      headers.forEach((h, idx) => {
        const key = headerMap[idx];
        if (key && rows[i][idx] !== undefined) {
          rawRow[key] = rows[i][idx];
        }
      });

      const { data, errors } = validateRow(rawRow, i, projectMembers);
      allErrors.push(...errors);
      previewRows.push({
        row: i,
        ...data,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    res.json({
      totalRows: previewRows.length,
      validRows: previewRows.filter(r => !r.errors).length,
      invalidRows: previewRows.filter(r => r.errors).length,
      headers: headers,
      mappedHeaders: headerMap,
      unmappedHeaders,
      preview: previewRows,
      errors: allErrors
    });
  } catch (err) {
    console.error('CSV preview error:', err);
    res.status(500).json({ error: 'Failed to parse CSV' });
  }
});

// POST /api/csv-upload/import/:projectId - Import validated CSV tasks
router.post('/import/:projectId', express.json(), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { tasks } = req.body; // Array of validated task objects from preview

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'No tasks to import' });
    }

    if (tasks.length > 500) {
      return res.status(400).json({ error: 'Maximum 500 tasks per import' });
    }

    // Verify user has access and is at least a member
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId: req.userId }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (membership.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot import tasks' });
    }

    // Create all tasks in a transaction
    const created = await prisma.$transaction(
      tasks.map(task =>
        prisma.task.create({
          data: {
            title: task.title,
            description: task.description || null,
            status: task.status || TASK_STATUS.TODO,
            priority: task.priority || TASK_PRIORITY.MEDIUM,
            tags: task.tags || [],
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            assigneeId: task.assigneeId || null,
            projectId,
            createdById: req.userId
          },
          include: {
            assignee: { select: { id: true, name: true, email: true } }
          }
        })
      )
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'bulk_import',
        details: { taskCount: created.length, source: 'csv' },
        userId: req.userId,
        projectId
      }
    });

    res.json({
      imported: created.length,
      tasks: created
    });
  } catch (err) {
    console.error('CSV import error:', err);
    res.status(500).json({ error: 'Failed to import tasks' });
  }
});

// GET /api/csv-upload/template - Download CSV template
router.get('/template', (req, res) => {
  const template = `title,description,status,priority,due_date,tags,assignee_email
"Design landing page","Create responsive landing page with hero section",todo,high,2026-04-01,"design|frontend",team@example.com
"Set up CI/CD","Configure GitHub Actions pipeline",in-progress,medium,2026-03-20,"devops|infra",
"Write API docs","Document all REST endpoints",todo,low,2026-04-15,"docs",`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="planora-tasks-template.csv"');
  res.send(template);
});

module.exports = router;
