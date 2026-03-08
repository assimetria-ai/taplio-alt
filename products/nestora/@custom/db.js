/**
 * Database connection module for Nestora
 * Uses SQLite with better-sqlite3 for synchronous operations
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'nestora.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db = null;

/**
 * Initialize database connection and create tables
 */
function initDatabase() {
  if (db) return db;

  // Create database file if it doesn't exist
  db = new Database(DB_PATH, { verbose: console.log });
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Run schema initialization
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  
  console.log('✅ Database initialized:', DB_PATH);
  
  return db;
}

/**
 * Get database instance
 */
function getDb() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

module.exports = {
  initDatabase,
  getDb,
  closeDb
};
