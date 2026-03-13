// @custom/api/og-image.js - OpenGraph Image Preview Generator
// Generates OG images as SVG for social media previews
// Supports custom templates: default, project, task, landing

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Cache directory for generated images
const CACHE_DIR = path.join(__dirname, '../../.og-cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Brand colors
const BRAND = {
  primary: '#5E6AD2',
  primaryLight: '#7B84E0',
  dark: '#1A1D2E',
  darker: '#131521',
  white: '#FFFFFF',
  gray: '#A0A3BD',
  accent: '#6C63FF',
  gradient: ['#5E6AD2', '#8B5CF6'],
};

// Template definitions
const TEMPLATES = {
  // Default branded OG image
  default: ({ title, subtitle, brandName }) => `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.darker}"/>
      <stop offset="100%" style="stop-color:${BRAND.dark}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.gradient[0]}"/>
      <stop offset="100%" style="stop-color:${BRAND.gradient[1]}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative circles -->
  <circle cx="1050" cy="100" r="200" fill="${BRAND.primary}" opacity="0.08" filter="url(#glow)"/>
  <circle cx="150" cy="530" r="150" fill="${BRAND.accent}" opacity="0.06" filter="url(#glow)"/>
  <!-- Accent bar -->
  <rect x="80" y="200" width="6" height="80" rx="3" fill="url(#accent)"/>
  <!-- Title -->
  <text x="110" y="245" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="700" fill="${BRAND.white}" letter-spacing="-1">
    ${escapeXml(truncate(title || brandName || 'Planora', 40))}
  </text>
  <!-- Subtitle -->
  <text x="110" y="295" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="24" fill="${BRAND.gray}" letter-spacing="0.5">
    ${escapeXml(truncate(subtitle || 'Plan smarter. Ship faster.', 80))}
  </text>
  <!-- Brand -->
  <text x="80" y="560" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="${BRAND.primary}" letter-spacing="2">
    ${escapeXml((brandName || 'PLANORA').toUpperCase())}
  </text>
  <!-- Bottom accent line -->
  <rect x="0" y="620" width="1200" height="10" fill="url(#accent)"/>
</svg>`,

  // Project board preview
  project: ({ title, subtitle, status, taskCount, memberCount }) => `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.darker}"/>
      <stop offset="100%" style="stop-color:${BRAND.dark}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.gradient[0]}"/>
      <stop offset="100%" style="stop-color:${BRAND.gradient[1]}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Header area -->
  <rect x="60" y="60" width="1080" height="120" rx="12" fill="${BRAND.dark}" stroke="${BRAND.primary}" stroke-width="1" opacity="0.8"/>
  <text x="100" y="115" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="${BRAND.gray}" text-transform="uppercase" letter-spacing="3">PROJECT</text>
  <text x="100" y="155" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" fill="${BRAND.white}">
    ${escapeXml(truncate(title || 'Untitled Project', 35))}
  </text>
  <!-- Stats cards -->
  ${renderStatCard(140, 240, 'Tasks', taskCount || '0', BRAND.primary)}
  ${renderStatCard(440, 240, 'Members', memberCount || '0', BRAND.accent)}
  ${renderStatCard(740, 240, 'Status', status || 'Active', '#22C55E')}
  <!-- Description -->
  <text x="100" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="${BRAND.gray}">
    ${escapeXml(truncate(subtitle || '', 70))}
  </text>
  <!-- Brand footer -->
  <text x="80" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="${BRAND.primary}" letter-spacing="2">PLANORA</text>
  <text x="210" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="${BRAND.gray}">Plan smarter. Ship faster.</text>
  <rect x="0" y="620" width="1200" height="10" fill="url(#accent)"/>
</svg>`,

  // Task detail preview
  task: ({ title, subtitle, priority, status, assignee }) => {
    const priorityColors = { critical: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#6B7280' };
    const statusColors = { done: '#22C55E', in_progress: '#3B82F6', review: '#F59E0B', stuck: '#EF4444', todo: '#6B7280' };
    const pColor = priorityColors[priority?.toLowerCase()] || BRAND.gray;
    const sColor = statusColors[status?.toLowerCase()?.replace(' ', '_')] || BRAND.gray;
    
    return `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.darker}"/>
      <stop offset="100%" style="stop-color:${BRAND.dark}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.gradient[0]}"/>
      <stop offset="100%" style="stop-color:${BRAND.gradient[1]}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Task icon area -->
  <rect x="80" y="120" width="56" height="56" rx="12" fill="${BRAND.primary}" opacity="0.2"/>
  <text x="96" y="158" font-family="system-ui" font-size="28" fill="${BRAND.primary}">✓</text>
  <!-- Title -->
  <text x="160" y="158" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700" fill="${BRAND.white}">
    ${escapeXml(truncate(title || 'Untitled Task', 35))}
  </text>
  <!-- Description -->
  <text x="80" y="230" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="${BRAND.gray}">
    ${escapeXml(truncate(subtitle || '', 70))}
  </text>
  <!-- Badges -->
  ${priority ? `
  <rect x="80" y="290" width="${priority.length * 14 + 40}" height="40" rx="20" fill="${pColor}" opacity="0.15"/>
  <text x="100" y="316" font-family="system-ui" font-size="16" font-weight="600" fill="${pColor}">${escapeXml(priority.toUpperCase())}</text>
  ` : ''}
  ${status ? `
  <rect x="${80 + (priority ? priority.length * 14 + 60 : 0)}" y="290" width="${status.length * 12 + 40}" height="40" rx="20" fill="${sColor}" opacity="0.15"/>
  <text x="${100 + (priority ? priority.length * 14 + 60 : 0)}" y="316" font-family="system-ui" font-size="16" font-weight="600" fill="${sColor}">${escapeXml(status.toUpperCase())}</text>
  ` : ''}
  ${assignee ? `
  <circle cx="110" cy="410" r="24" fill="${BRAND.primary}"/>
  <text x="100" y="418" font-family="system-ui" font-size="18" font-weight="600" fill="${BRAND.white}">${escapeXml(assignee.charAt(0).toUpperCase())}</text>
  <text x="150" y="418" font-family="system-ui" font-size="20" fill="${BRAND.gray}">${escapeXml(assignee)}</text>
  ` : ''}
  <!-- Brand -->
  <text x="80" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="${BRAND.primary}" letter-spacing="2">PLANORA</text>
  <rect x="0" y="620" width="1200" height="10" fill="url(#accent)"/>
</svg>`;
  },

  // Landing/marketing preview
  landing: ({ title, subtitle, features }) => {
    const featureList = (features || 'Projects,Tasks,Teams,Analytics').split(',').slice(0, 4);
    return `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.darker}"/>
      <stop offset="50%" style="stop-color:${BRAND.dark}"/>
      <stop offset="100%" style="stop-color:#1a1040"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.gradient[0]}"/>
      <stop offset="100%" style="stop-color:${BRAND.gradient[1]}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Large decorative element -->
  <circle cx="900" cy="315" r="250" fill="${BRAND.primary}" opacity="0.05" filter="url(#glow)"/>
  <circle cx="950" cy="280" r="150" fill="${BRAND.accent}" opacity="0.04" filter="url(#glow)"/>
  <!-- Hero text -->
  <text x="80" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="${BRAND.white}" letter-spacing="-2">
    ${escapeXml(truncate(title || 'Plan smarter.', 25))}
  </text>
  <text x="80" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="${BRAND.primary}" letter-spacing="-2">
    ${escapeXml(truncate(subtitle || 'Ship faster.', 25))}
  </text>
  <!-- Feature pills -->
  ${featureList.map((f, i) => `
    <rect x="${80 + i * 180}" y="340" width="160" height="44" rx="22" fill="${BRAND.primary}" opacity="0.12"/>
    <text x="${115 + i * 180}" y="368" font-family="system-ui" font-size="16" font-weight="500" fill="${BRAND.primaryLight}">${escapeXml(f.trim())}</text>
  `).join('')}
  <!-- Brand -->
  <text x="80" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="${BRAND.white}" letter-spacing="1">Planora</text>
  <text x="235" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="${BRAND.gray}">AI-Powered Project Management</text>
  <rect x="0" y="620" width="1200" height="10" fill="url(#accent)"/>
</svg>`;
  },
};

// Helper: render a stat card for project template
function renderStatCard(x, y, label, value, color) {
  return `
    <rect x="${x}" y="${y}" width="220" height="120" rx="12" fill="${BRAND.dark}" stroke="${color}" stroke-width="1" opacity="0.6"/>
    <text x="${x + 30}" y="${y + 45}" font-family="system-ui" font-size="14" fill="${BRAND.gray}" letter-spacing="2">${escapeXml(label.toUpperCase())}</text>
    <text x="${x + 30}" y="${y + 90}" font-family="system-ui" font-size="36" font-weight="700" fill="${color}">${escapeXml(String(value))}</text>
  `;
}

// Helper: escape XML special characters
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper: truncate text
function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
}

// Helper: generate cache key
function getCacheKey(params) {
  const hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
  return hash;
}

/**
 * GET /api/og-image
 * Query params:
 *   template: default|project|task|landing (default: 'default')
 *   title: Main title text
 *   subtitle: Secondary text
 *   status: Task/project status
 *   priority: Task priority (critical|high|medium|low)
 *   assignee: Task assignee name
 *   taskCount: Number of tasks (project template)
 *   memberCount: Number of members (project template)
 *   features: Comma-separated feature list (landing template)
 *   brandName: Override brand name
 *   format: svg (default) - SVG output
 *   nocache: 1 to bypass cache
 */
router.get('/', (req, res) => {
  try {
    const {
      template = 'default',
      title,
      subtitle,
      status,
      priority,
      assignee,
      taskCount,
      memberCount,
      features,
      brandName,
      format = 'svg',
      nocache,
    } = req.query;

    // Validate template
    const templateFn = TEMPLATES[template];
    if (!templateFn) {
      return res.status(400).json({
        error: 'Invalid template',
        available: Object.keys(TEMPLATES),
      });
    }

    const params = { title, subtitle, status, priority, assignee, taskCount, memberCount, features, brandName };

    // Check cache
    const cacheKey = getCacheKey({ template, ...params });
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.svg`);

    if (!nocache && fs.existsSync(cachePath)) {
      const cached = fs.readFileSync(cachePath, 'utf-8');
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-OG-Cache', 'hit');
      return res.send(cached);
    }

    // Generate SVG
    const svg = templateFn(params).trim();

    // Cache the result
    try {
      fs.writeFileSync(cachePath, svg);
    } catch (e) {
      // Cache write failure is non-fatal
      console.warn('OG image cache write failed:', e.message);
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-OG-Cache', 'miss');
    res.send(svg);
  } catch (err) {
    console.error('OG image generation error:', err);
    res.status(500).json({ error: 'Failed to generate OG image' });
  }
});

/**
 * GET /api/og-image/templates
 * List available templates and their parameters
 */
router.get('/templates', (req, res) => {
  res.json({
    templates: {
      default: {
        description: 'Default branded OG image',
        params: ['title', 'subtitle', 'brandName'],
      },
      project: {
        description: 'Project board preview with stats',
        params: ['title', 'subtitle', 'status', 'taskCount', 'memberCount'],
      },
      task: {
        description: 'Task detail preview with priority and status badges',
        params: ['title', 'subtitle', 'priority', 'status', 'assignee'],
      },
      landing: {
        description: 'Marketing/landing page preview',
        params: ['title', 'subtitle', 'features'],
      },
    },
    dimensions: { width: 1200, height: 630 },
    format: 'SVG',
  });
});

/**
 * POST /api/og-image/clear-cache
 * Clear the OG image cache
 */
router.post('/clear-cache', (req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let cleared = 0;
    for (const file of files) {
      if (file.endsWith('.svg')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
        cleared++;
      }
    }
    res.json({ cleared, message: `Cleared ${cleared} cached OG images` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;
