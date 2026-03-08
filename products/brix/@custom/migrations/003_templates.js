/**
 * Brix - Templates Table Migration
 * Task #9681 - MVP: Pre-built storefront templates
 */

exports.up = async function(knex) {
  await knex.schema.createTable('templates', (table) => {
    // Primary key
    table.string('id', 100).primary()  // e.g., 'minimal', 'modern'
    
    // Core template info
    table.string('name', 255).notNullable()
    table.text('description')
    table.string('category', 100)     // 'minimal', 'modern', 'classic', 'bold'
    
    // Preview
    table.string('preview_image', 500)
    table.string('thumbnail', 500)
    
    // Configuration
    table.jsonb('default_blocks').notNullable()    // Initial block layout
    table.jsonb('default_settings').defaultTo('{}') // Default colors, fonts
    
    // Features
    table.jsonb('features').defaultTo('[]')        // Highlight features
    
    // Status
    table.boolean('is_active').defaultTo(true)
    table.boolean('is_premium').defaultTo(false)
    
    // Timestamps
    table.timestamps(true, true)
    
    // Indexes
    table.index('category')
    table.index('is_active')
  })

  console.log('✅ Created templates table')
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('templates')
  console.log('✅ Dropped templates table')
}
