/**
 * @custom Migration: Content Suggestions
 * Creates tables for AI-generated content suggestions and optimal posting times.
 */
const path = require('path')
const fs = require('fs')
const db = require('../../repos/@system/db-instance')

async function up() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/content_suggestions.sql'),
    'utf8'
  )
  await db.none(sql)
  console.log('  ✓ content_suggestions table created')
  console.log('  ✓ optimal_posting_times table created')
}

async function down() {
  await db.none('DROP TABLE IF EXISTS optimal_posting_times CASCADE')
  await db.none('DROP TABLE IF EXISTS content_suggestions CASCADE')
}

module.exports = { up, down }
