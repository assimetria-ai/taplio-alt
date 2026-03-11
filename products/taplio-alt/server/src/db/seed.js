'use strict';

/**
 * seed.js — Product Template database seeder
 *
 * Populates: users (admin + sample), roles, settings
 *
 * Usage:
 *   DATABASE_URL=postgres://... node server/src/db/seed.js
 *
 * Security:
 *   - Seed passwords are randomly generated via crypto.randomBytes()
 *   - Credentials are NEVER printed to stdout/stderr
 *   - Generated passwords are written once to seed-credentials.txt (mode 0600)
 *     and MUST be stored securely — the file is git-ignored
 *
 * Requires: pg, bcryptjs
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  process.stderr.write('[seed:error] DATABASE_URL environment variable is required\n');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random password.
 * Returns a 24-character URL-safe base64 string (~143 bits of entropy).
 */
function generatePassword() {
  return crypto.randomBytes(18).toString('base64url');
}

function log(msg) {
  process.stdout.write(`[seed] ${msg}\n`);
}

function err(msg, error) {
  process.stderr.write(`[seed:error] ${msg}: ${error.message}\n`);
}

/**
 * Write generated seed credentials to a local file (mode 0600).
 * The file is git-ignored and must never be committed.
 *
 * @param {Array<{email: string, password: string, role: string}>} credentials
 */
function writeCredentialsFile(credentials) {
  const filePath = path.resolve(__dirname, '../../../../seed-credentials.txt');
  const lines = [
    '# Seed credentials — KEEP PRIVATE, DO NOT COMMIT',
    `# Generated: ${new Date().toISOString()}`,
    '',
    ...credentials.map(
      (c) => `${c.role.padEnd(10)} | ${c.email.padEnd(30)} | ${c.password}`
    ),
    '',
  ];
  fs.writeFileSync(filePath, lines.join('\n'), { mode: 0o600 });
  log(`Seed credentials written to ${path.basename(filePath)} (keep private)`);
}

// ---------------------------------------------------------------------------
// Seed data — Users
// ---------------------------------------------------------------------------
const SEED_USERS = [
  {
    email: 'admin@example.com',
    name: 'Admin',
    role: 'admin',
    force_password_change: true,
  },
  {
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'member',
    force_password_change: false,
  },
];

// ---------------------------------------------------------------------------
// Seed data — Roles
// ---------------------------------------------------------------------------
const ROLES = [
  { name: 'admin', description: 'Full system access' },
  { name: 'member', description: 'Standard user access' },
  { name: 'viewer', description: 'Read-only access' },
];

// ---------------------------------------------------------------------------
// Seed data — Default settings
// ---------------------------------------------------------------------------
const DEFAULT_SETTINGS = [
  { key: 'app_name', value: 'My Product', public: true },
  { key: 'registration_enabled', value: 'true', public: true },
  { key: 'maintenance_mode', value: 'false', public: true },
  { key: 'max_upload_mb', value: '10', public: false },
  { key: 'session_timeout_minutes', value: '60', public: false },
];

// ---------------------------------------------------------------------------
// Seed data — Sample content
// ---------------------------------------------------------------------------
const SAMPLE_ITEMS = [
  {
    title: 'Welcome to the template',
    body: 'This is a sample item created by the seed script.',
    status: 'published',
  },
  {
    title: 'Getting started guide',
    body: 'Review the README to understand the project structure.',
    status: 'draft',
  },
  {
    title: 'Feature: user management',
    body: 'Users can be invited, assigned roles, and deactivated.',
    status: 'published',
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seed is not allowed in production environments');
  }

  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    log('Connected to PostgreSQL');

    // ---- Roles ----
    log(`Inserting ${ROLES.length} roles...`);
    for (const role of ROLES) {
      await client.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET
           description = EXCLUDED.description,
           updated_at  = NOW()`,
        [role.name, role.description]
      );
    }
    log('Roles seeded.');

    // ---- Users ----
    log(`Inserting ${SEED_USERS.length} seed users...`);
    const generatedCredentials = [];

    for (const user of SEED_USERS) {
      const plainPassword = generatePassword();
      const passwordHash = await bcrypt.hash(plainPassword, 12);

      await client.query(
        `INSERT INTO users (email, name, password_hash, role, force_password_change)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET
           name                  = EXCLUDED.name,
           role                  = EXCLUDED.role,
           force_password_change = EXCLUDED.force_password_change,
           updated_at            = NOW()`,
        [
          user.email,
          user.name,
          passwordHash,
          user.role,
          user.force_password_change,
        ]
      );

      // Collect for file output — never log to stdout/stderr
      generatedCredentials.push({
        email: user.email,
        role: user.role,
        password: plainPassword,
      });
    }

    log('Users seeded.');

    // Write credentials to a protected local file (never to console)
    writeCredentialsFile(generatedCredentials);

    // ---- Settings ----
    log(`Inserting ${DEFAULT_SETTINGS.length} default settings...`);
    for (const setting of DEFAULT_SETTINGS) {
      await client.query(
        `INSERT INTO settings (key, value, public)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.public]
      );
    }
    log('Settings seeded.');

    // ---- Sample content ----
    log(`Inserting ${SAMPLE_ITEMS.length} sample items...`);
    for (const item of SAMPLE_ITEMS) {
      await client.query(
        `INSERT INTO items (title, body, status)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [item.title, item.body, item.status]
      );
    }
    log('Sample items seeded.');

    log('Database seeded successfully.');
  } catch (error) {
    err('Seed failed', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
