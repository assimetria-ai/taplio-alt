/**
 * Sanitization utilities
 * Task #11202 - Fix CSS injection risk in domain branding
 * 
 * Provides HTML escaping and CSS sanitization to prevent injection attacks.
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Raw string to escape
 * @returns {string} HTML-safe string
 */
function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Dangerous CSS patterns that enable data exfiltration or code execution
 */
const DANGEROUS_CSS_PATTERNS = [
  /url\s*\(/gi,           // url() - data exfiltration via background-image
  /@import/gi,            // @import - load external stylesheets
  /expression\s*\(/gi,    // expression() - IE CSS expressions (code execution)
  /behavior\s*:/gi,       // behavior: - IE HTC behaviors
  /-moz-binding\s*:/gi,   // -moz-binding - Firefox XBL bindings
  /javascript\s*:/gi,     // javascript: protocol
  /vbscript\s*:/gi,       // vbscript: protocol
  /data\s*:/gi,           // data: protocol in CSS values
  /\\00/gi,               // Null byte injection
];

/**
 * Sanitize CSS string by removing dangerous patterns.
 * Returns null if the CSS contains any dangerous patterns (reject approach).
 * 
 * @param {string} css - Raw CSS string
 * @returns {{ safe: boolean, cleaned: string|null, violations: string[] }}
 */
function sanitizeCss(css) {
  if (!css || typeof css !== 'string') {
    return { safe: true, cleaned: '', violations: [] };
  }

  const violations = [];
  
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    if (pattern.test(css)) {
      violations.push(pattern.source);
      // Reset regex lastIndex since we use /g flag
      pattern.lastIndex = 0;
    }
  }

  if (violations.length > 0) {
    return { safe: false, cleaned: null, violations };
  }

  return { safe: true, cleaned: css, violations: [] };
}

/**
 * Validate and sanitize domain metadata JSON.
 * Strips any css/script-related keys to prevent injection via metadata field.
 * 
 * @param {object} metadata - Raw metadata object
 * @returns {object} Sanitized metadata
 */
function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return {};
  
  const BLOCKED_KEYS = [
    'custom_css', 'customCss', 'css', 'style', 'styles',
    'script', 'scripts', 'javascript', 'html',
    'onload', 'onerror', 'onclick'
  ];
  
  const sanitized = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (BLOCKED_KEYS.includes(lowerKey)) continue;
    // Only allow string/number/boolean values in metadata
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

module.exports = { escapeHtml, sanitizeCss, sanitizeMetadata };
