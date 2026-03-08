/**
 * Brix - Products Table Migration
 * Task #9681 - MVP: Product catalog creation
 */

exports.up = async function(knex) {
  await knex.schema.createTable('products', (table) => {
    // Primary key
    table.increments('id').primary()
    
    // Ownership
    table.integer('user_id').notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    
    // Core product info
    table.string('name', 255).notNullable()
    table.string('slug', 255).notNullable()
    table.text('description')
    table.decimal('price', 10, 2).notNullable()
    
    // Media
    table.jsonb('images').defaultTo('[]')
    
    // Inventory
    table.string('sku', 100)
    table.integer('inventory').defaultTo(0)
    
    // Variants (size, color, etc.)
    table.jsonb('variants').defaultTo('[]')
    
    // Organization
    table.jsonb('categories').defaultTo('[]')
    table.jsonb('tags').defaultTo('[]')
    
    // Status
    table.enum('status', ['draft', 'active', 'archived']).defaultTo('draft')
    
    // Timestamps
    table.timestamps(true, true)
    
    // Indexes
    table.unique(['user_id', 'slug'])
    table.index('user_id')
    table.index('status')
    table.index('slug')
  })

  console.log('✅ Created products table')
}

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('products')
  console.log('✅ Dropped products table')
}
