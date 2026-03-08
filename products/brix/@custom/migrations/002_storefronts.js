/**
 * Brix - Storefronts Table Migration
 * Task #9681 - MVP: Storefront template selection
 */

exports.up = async function(knex) {
  await knex.schema.createTable('storefronts', (table) => {
    // Primary key
    table.increments('id').primary()
    
    // Ownership
    table.integer('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    
    // Core storefront info
    table.string('name', 255).notNullable()
    table.string('slug', 255).notNullable().unique()
    
    // Template
    table.string('template_id', 100).notNullable()
    
    // Domain
    table.string('custom_domain', 255)
    
    // Configuration
    table.jsonb('settings').defaultTo('{}')  // colors, fonts, logo
    table.jsonb('blocks').defaultTo('[]')    // page layout blocks
    
    // Metadata
    table.jsonb('seo').defaultTo('{}')       // title, description, og:image
    
    // Status
    table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft')
    table.timestamp('published_at')
    
    // Timestamps
    table.timestamps(true, true)
    
    // Indexes
    table.unique(['user_id', 'slug'])
    table.index('user_id')
    table.index('slug')
    table.index('status')
    table.index('custom_domain')
  })

  console.log('✅ Created storefronts table')
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('storefronts')
  console.log('✅ Dropped storefronts table')
}
