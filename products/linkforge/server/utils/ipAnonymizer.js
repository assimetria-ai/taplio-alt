// server/utils/ipAnonymizer.js - GDPR-compliant IP anonymization
// Task #11203 - IP address stored in click_events without GDPR compliance
//
// Implements:
// 1. IPv4: zero last octet (e.g., 192.168.1.100 → 192.168.1.0)
// 2. IPv6: zero last 80 bits (keep /48 prefix)
// 3. Hashed version for rate-limiting (where uniqueness matters)

const crypto = require('crypto');

// Salt for IP hashing — loaded from env or fallback
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'linkforge-gdpr-ip-salt-change-me';

/**
 * Truncate an IP address for GDPR compliance.
 * IPv4: zeros the last octet (e.g., 1.2.3.4 → 1.2.3.0)
 * IPv6: keeps only the first 48 bits (/48 prefix)
 * 
 * @param {string} ip - Raw IP address
 * @returns {string} Truncated IP address
 */
function truncateIP(ip) {
  if (!ip || ip === 'unknown') return 'unknown';

  // Strip IPv4-mapped IPv6 prefix
  const cleanIP = ip.replace(/^::ffff:/, '');

  // IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanIP)) {
    const parts = cleanIP.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  // IPv6: keep first 3 groups (48 bits), zero the rest
  if (cleanIP.includes(':')) {
    const expanded = expandIPv6(cleanIP);
    const groups = expanded.split(':');
    // Keep first 3 groups, zero rest
    for (let i = 3; i < 8; i++) {
      groups[i] = '0000';
    }
    return groups.join(':');
  }

  // Fallback: return as-is (shouldn't happen)
  return cleanIP;
}

/**
 * Hash an IP address for rate-limiting purposes.
 * Uses SHA-256 with a salt. Produces a consistent hash per IP
 * so rate-limiting still works, but the IP can't be recovered.
 * 
 * @param {string} ip - Raw IP address
 * @returns {string} Hashed IP (hex, first 16 chars)
 */
function hashIP(ip) {
  if (!ip || ip === 'unknown') return 'unknown';
  
  return crypto
    .createHmac('sha256', IP_HASH_SALT)
    .update(ip)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Expand a shortened IPv6 address to full form.
 * @param {string} ip - IPv6 address (possibly abbreviated)
 * @returns {string} Full IPv6 address with 8 groups
 */
function expandIPv6(ip) {
  // Handle :: expansion
  if (ip.includes('::')) {
    const [left, right] = ip.split('::');
    const leftGroups = left ? left.split(':') : [];
    const rightGroups = right ? right.split(':') : [];
    const missing = 8 - leftGroups.length - rightGroups.length;
    const middleGroups = Array(missing).fill('0000');
    const allGroups = [...leftGroups, ...middleGroups, ...rightGroups];
    return allGroups.map(g => g.padStart(4, '0')).join(':');
  }
  return ip.split(':').map(g => g.padStart(4, '0')).join(':');
}

module.exports = {
  truncateIP,
  hashIP
};
