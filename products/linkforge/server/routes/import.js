// server/routes/import.js - CSV Bulk Import API
// Task #10314 - Build bulk link import via CSV

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse/sync');
const { nanoid } = require('nanoid');

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

/**
 * POST /api/import/csv
 * Upload and process CSV file for bulk link creation
 */
router.post('/csv', upload.single('file'), async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse CSV
    const fileContent = req.file.buffer.toString('utf-8');
    let records;

    try {
      records = csv.parse(fileContent, {
        columns: true, // First row as headers
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      return res.status(400).json({
        error: 'Failed to parse CSV file',
        details: parseError.message
      });
    }

    if (records.length === 0) {
      return res.status(400).json({
        error: 'CSV file is empty'
      });
    }

    if (records.length > 1000) {
      return res.status(400).json({
        error: 'Too many rows. Maximum 1000 links per import.'
      });
    }

    // TODO: Get authenticated user
    const userId = req.user?.id || null;

    // Process each row
    const results = {
      total: records.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      links: []
    };

    // Validate and transform records
    const validatedRecords = [];
    
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because: 0-indexed + header row
      
      try {
        const validated = await validateRow(row, rowNum, prisma);
        validatedRecords.push(validated);
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          data: row,
          error: error.message
        });
      }
    }

    // Bulk create links
    for (const record of validatedRecords) {
      try {
        const link = await prisma.link.create({
          data: {
            slug: record.slug,
            targetUrl: record.targetUrl,
            title: record.title,
            tags: record.tags,
            userId: userId,
            domainId: record.domainId
          }
        });

        results.successful++;
        results.links.push({
          slug: link.slug,
          targetUrl: link.targetUrl,
          shortUrl: `${process.env.PRIMARY_DOMAIN || 'localhost'}/${link.slug}`
        });
      } catch (createError) {
        results.failed++;
        results.errors.push({
          row: record.rowNum,
          data: record.original,
          error: createError.message
        });
      }
    }

    // Return results
    res.json({
      success: results.failed === 0,
      message: `Import complete: ${results.successful} created, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      error: 'Import failed',
      message: error.message
    });
  }
});

/**
 * Validate a CSV row
 */
async function validateRow(row, rowNum, prisma) {
  const errors = [];

  // Map common column names (case-insensitive)
  const targetUrl = row.targetUrl || row.target_url || row.url || row.URL || row['Target URL'];
  const slug = row.slug || row.short || row.shortcode || row.Slug || row['Custom Slug'];
  const title = row.title || row.name || row.Title || row.Name;
  const tagsStr = row.tags || row.Tags || row.labels || row.Labels;
  
  // Validate target URL (required)
  if (!targetUrl) {
    throw new Error('Missing target URL');
  }

  // Validate URL format and protocol
  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error(`Only http and https URLs are allowed: ${targetUrl}`);
    }
  } catch (e) {
    if (e.message.includes('Only http')) throw e;
    throw new Error(`Invalid URL format: ${targetUrl}`);
  }

  // Generate or validate slug
  let finalSlug = slug ? slug.trim().toLowerCase() : nanoid(6);

  // Validate slug format
  if (!/^[a-z0-9_-]+$/i.test(finalSlug)) {
    throw new Error(`Invalid slug format: ${finalSlug}. Only letters, numbers, hyphens, and underscores allowed.`);
  }

  // Check if slug already exists
  const existing = await prisma.link.findUnique({
    where: { slug: finalSlug }
  });

  if (existing) {
    // Auto-generate new slug if collision
    finalSlug = `${finalSlug}-${nanoid(4)}`;
  }

  // Parse tags
  let tags = [];
  if (tagsStr) {
    // Split by comma, semicolon, or pipe
    tags = tagsStr
      .split(/[,;|]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  return {
    rowNum,
    slug: finalSlug,
    targetUrl: targetUrl.trim(),
    title: title ? title.trim() : null,
    tags: tags,
    domainId: null, // TODO: Support domain mapping
    original: row
  };
}

/**
 * GET /api/import/template
 * Download CSV template
 */
router.get('/template', (req, res) => {
  const template = `targetUrl,slug,title,tags
https://example.com/page1,promo,My Promo Page,"marketing,campaign"
https://example.com/page2,demo,Demo Page,"product,demo"
https://example.com/page3,,Another Page,"general"`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="linkforge-import-template.csv"');
  res.send(template);
});

/**
 * POST /api/import/validate
 * Validate CSV without creating links
 */
router.post('/validate', upload.single('file'), async (req, res) => {
  const prisma = req.app.locals.prisma;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse CSV
    const fileContent = req.file.buffer.toString('utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Validate each row
    const validation = {
      valid: 0,
      invalid: 0,
      errors: [],
      preview: []
    };

    for (let i = 0; i < Math.min(records.length, 100); i++) {
      const row = records[i];
      const rowNum = i + 2;

      try {
        const validated = await validateRow(row, rowNum, prisma);
        validation.valid++;
        
        if (i < 10) {
          validation.preview.push({
            row: rowNum,
            slug: validated.slug,
            targetUrl: validated.targetUrl,
            title: validated.title,
            tags: validated.tags
          });
        }
      } catch (error) {
        validation.invalid++;
        validation.errors.push({
          row: rowNum,
          error: error.message,
          data: row
        });
      }
    }

    res.json({
      totalRows: records.length,
      validation,
      ready: validation.invalid === 0
    });

  } catch (error) {
    console.error('CSV validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message
    });
  }
});

module.exports = router;
