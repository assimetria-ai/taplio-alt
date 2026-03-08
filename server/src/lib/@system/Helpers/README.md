# API Helpers - Complete Guide

This guide shows how to build REST APIs quickly using the built-in helpers for pagination, search, and CRUD operations.

## Quick Start

```javascript
const { createCrudRouter } = require('../../lib/@system/Helpers')

module.exports = createCrudRouter({
  repo: myRepo,
  config: {
    basePath: '/api/resources',
    dataKey: 'resource',
  },
})
```

That's it! You now have a fully functional CRUD API with pagination and search.

## Table of Contents

1. [CRUD Helpers](#crud-helpers)
2. [Pagination](#pagination)
3. [Search Helpers](#search-helpers)
4. [Advanced Patterns](#advanced-patterns)
5. [Repository Pattern](#repository-pattern)

---

## CRUD Helpers

### Auto-Generated CRUD Router

The fastest way to create a CRUD API:

```javascript
const { createCrudRouter } = require('../../lib/@system/Helpers')

const router = createCrudRouter({
  repo: productsRepo,
  validation: {
    create: createProductSchema,
    update: updateProductSchema,
  },
  middleware: {
    list: [authenticate],
    create: [authenticate, requireAdmin],
    update: [authenticate, requireOwner],
    delete: [authenticate, requireOwner],
  },
  config: {
    basePath: '/api/products',
    dataKey: 'product',
    messages: {
      notFound: 'Product not found',
      deleted: 'Product deleted successfully',
    },
  },
})

module.exports = router
```

This creates:
- `GET /api/products` - List with pagination & search
- `GET /api/products/:id` - Get by ID
- `POST /api/products` - Create
- `PATCH /api/products/:id` - Update
- `DELETE /api/products/:id` - Delete

### Manual CRUD Handlers

For more control, use individual handlers:

#### List with Pagination & Search

```javascript
const { handleList, parseSearchQuery, buildWhereClause } = require('../../lib/@system/Helpers')
const { pagination } = require('../../lib/@system/Middleware')

router.get('/api/products', pagination(), async (req, res, next) => {
  // Parse search query
  const search = parseSearchQuery(req.query, {
    defaultFields: ['name', 'description', 'sku'],
  })
  
  // Build filters
  const filters = {}
  if (req.query.category) filters.category = req.query.category
  if (req.query.in_stock) filters.in_stock = req.query.in_stock === 'true'
  
  // Build WHERE clause
  const { whereClause, params } = buildWhereClause({
    searchQuery: search.query,
    searchFields: search.fields,
    filters,
  })
  
  await handleList({
    repo: productsRepo,
    req,
    res,
    next,
    filters: { whereClause, params },
    dataKey: 'products',
  })
})
```

#### Get by ID

```javascript
const { handleGetById } = require('../../lib/@system/Helpers')

router.get('/api/products/:id', (req, res, next) => {
  handleGetById({
    repo: productsRepo,
    req,
    res,
    next,
    dataKey: 'product',
    notFoundMessage: 'Product not found',
  })
})
```

#### Create

```javascript
const { handleCreate } = require('../../lib/@system/Helpers')
const { validate } = require('../../lib/@system/Validation')

router.post('/api/products', validate(createProductSchema), (req, res, next) => {
  handleCreate({
    repo: productsRepo,
    req,
    res,
    next,
    transformData: async (body, req) => ({
      ...body,
      user_id: req.user.id,  // Add owner
      slug: generateSlug(body.name),  // Generate slug
    }),
    dataKey: 'product',
  })
})
```

#### Update

```javascript
const { handleUpdate } = require('../../lib/@system/Helpers')

router.patch('/api/products/:id', validate(updateProductSchema), (req, res, next) => {
  handleUpdate({
    repo: productsRepo,
    req,
    res,
    next,
    transformData: async (body, req, existing) => {
      // Custom validation
      if (existing.published && body.draft === true) {
        throw new Error('Cannot unpublish products')
      }
      
      return {
        ...body,
        updated_at: new Date(),
      }
    },
    dataKey: 'product',
  })
})
```

#### Delete

```javascript
const { handleDelete } = require('../../lib/@system/Helpers')

router.delete('/api/products/:id', (req, res, next) => {
  handleDelete({
    repo: productsRepo,
    req,
    res,
    next,
    hardDelete: false,  // Soft delete by default
    successMessage: 'Product deleted',
  })
})
```

---

## Pagination

### Middleware Usage

```javascript
const { pagination } = require('../../lib/@system/Middleware')

// Default config (limit: 20, max: 100)
router.get('/api/items', pagination(), handler)

// Custom config
router.get('/api/items', pagination({
  defaultLimit: 50,
  maxLimit: 200,
  allowAll: true,  // Allow limit=-1 for all results
}), handler)
```

### Query Parameters

Clients can use:
- `?limit=20` - Items per page
- `?offset=40` - Skip N items
- `?page=3` - Page number (auto-calculates offset)

### Response Format

```json
{
  "data": [...],
  "total": 156,
  "limit": 20,
  "offset": 40,
  "page": 3,
  "total_pages": 8,
  "has_more": true
}
```

### Manual Formatting

```javascript
const { formatPaginatedResponse } = require('../../lib/@system/Helpers')

const data = await repo.findAll({ limit: 20, offset: 0 })
const total = await repo.count()

const response = formatPaginatedResponse(data, total, req.pagination)
res.json(response)
```

---

## Search Helpers

### Parse Search Query

```javascript
const { parseSearchQuery } = require('../../lib/@system/Helpers')

const search = parseSearchQuery(req.query, {
  queryParam: 'q',  // Default: 'q'
  fieldsParam: 'fields',  // Default: 'fields'
  defaultFields: ['name', 'email', 'description'],
})

// search.query → sanitized search string
// search.fields → array of fields to search
// search.isEmpty → boolean
```

### Build WHERE Clause

```javascript
const { buildWhereClause } = require('../../lib/@system/Helpers')

const { whereClause, params } = buildWhereClause({
  searchQuery: 'john',
  searchFields: ['name', 'email'],
  filters: {
    status: 'active',
    role: 'admin',
    tags: ['featured', 'new'],  // Arrays → IN clause
  },
  searchMode: 'contains',  // 'contains' | 'starts_with' | 'exact'
})

// Execute query
const sql = `SELECT * FROM users ${whereClause} ORDER BY created_at DESC`
const results = await db.query(sql, params)
```

### Build ORDER BY Clause

```javascript
const { buildOrderByClause } = require('../../lib/@system/Helpers')

const orderBy = buildOrderByClause({
  sortBy: req.query.sort,  // Client-requested field
  sortOrder: req.query.order,  // 'asc' or 'desc'
  allowedFields: ['name', 'created_at', 'price'],  // Whitelist
  defaultSort: 'created_at',  // Fallback
})

// Returns: "ORDER BY created_at DESC"
```

### Sanitize Search Query

```javascript
const { sanitizeSearchQuery } = require('../../lib/@system/Helpers')

const clean = sanitizeSearchQuery(req.query.q)
// Removes SQL injection chars, normalizes whitespace, limits length
```

---

## Advanced Patterns

### Custom Filters

```javascript
router.get('/api/products', pagination(), async (req, res, next) => {
  const filters = {}
  
  // Single value filter
  if (req.query.category) {
    filters.category = req.query.category
  }
  
  // Boolean filter
  if (req.query.featured !== undefined) {
    filters.featured = req.query.featured === 'true'
  }
  
  // Range filter (price)
  if (req.query.min_price) {
    filters.price_min = parseFloat(req.query.min_price)
  }
  if (req.query.max_price) {
    filters.price_max = parseFloat(req.query.max_price)
  }
  
  // Array filter (tags)
  if (req.query.tags) {
    filters.tags = req.query.tags.split(',')
  }
  
  await handleList({ repo: productsRepo, req, res, next, filters })
})
```

### Access Control

```javascript
const { handleList } = require('../../lib/@system/Helpers')
const { authenticate, requireOwner } = require('../../lib/@system/Helpers/auth')

// List only user's own resources
router.get('/api/posts', authenticate, pagination(), async (req, res, next) => {
  await handleList({
    repo: postsRepo,
    req,
    res,
    next,
    defaults: {
      user_id: req.user.id,  // Only show user's posts
    },
  })
})

// Update with ownership check
router.patch('/api/posts/:id', authenticate, (req, res, next) => {
  handleUpdate({
    repo: postsRepo,
    req,
    res,
    next,
    transformData: async (body, req, existing) => {
      // Check ownership
      if (existing.user_id !== req.user.id) {
        throw new Error('Forbidden: Not your post')
      }
      return body
    },
  })
})
```

### Soft Delete

```javascript
// Repository must implement softDelete method
router.delete('/api/posts/:id', (req, res, next) => {
  handleDelete({
    repo: postsRepo,
    req,
    res,
    next,
    hardDelete: false,  // Calls repo.softDelete(id)
  })
})
```

---

## Repository Pattern

Your repository must implement these methods:

### Required for `handleList`

```javascript
class MyRepo {
  async findAll({ limit, offset, whereClause, params, orderBy, ...filters }) {
    const sql = `
      SELECT * FROM table
      ${whereClause}
      ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `
    return db.query(sql, params)
  }
  
  async count(filters) {
    const sql = `SELECT COUNT(*) FROM table WHERE ...`
    const result = await db.query(sql)
    return parseInt(result[0].count, 10)
  }
}
```

### Required for `handleGetById`

```javascript
async findById(id) {
  const sql = `SELECT * FROM table WHERE id = $1`
  const result = await db.query(sql, [id])
  return result[0] || null
}
```

### Required for `handleCreate`

```javascript
async create(data) {
  const sql = `INSERT INTO table (...) VALUES (...) RETURNING *`
  const result = await db.query(sql, Object.values(data))
  return result[0]
}
```

### Required for `handleUpdate`

```javascript
async update(id, data) {
  const sql = `UPDATE table SET ... WHERE id = $1 RETURNING *`
  const result = await db.query(sql, [...Object.values(data), id])
  return result[0]
}
```

### Required for `handleDelete`

```javascript
async delete(id) {
  const sql = `DELETE FROM table WHERE id = $1`
  await db.query(sql, [id])
}

// Optional: for soft delete
async softDelete(id) {
  const sql = `UPDATE table SET deleted_at = NOW() WHERE id = $1 RETURNING *`
  const result = await db.query(sql, [id])
  return result[0]
}
```

---

## Complete Example

```javascript
const express = require('express')
const router = express.Router()
const { pagination, validate } = require('../../lib/@system/Middleware')
const {
  handleList,
  handleGetById,
  handleCreate,
  handleUpdate,
  handleDelete,
  parseSearchQuery,
  buildWhereClause,
  buildOrderByClause,
  authenticate,
} = require('../../lib/@system/Helpers')
const productsRepo = require('../../db/repos/@custom/ProductsRepo')
const { createProductSchema, updateProductSchema } = require('../../lib/@custom/Validation/schemas/products')

// LIST with search, filters, and sorting
router.get('/api/products', pagination(), async (req, res, next) => {
  const search = parseSearchQuery(req.query, {
    defaultFields: ['name', 'description', 'sku'],
  })
  
  const filters = {}
  if (req.query.category) filters.category = req.query.category
  if (req.query.in_stock) filters.in_stock = req.query.in_stock === 'true'
  
  const { whereClause, params } = buildWhereClause({
    searchQuery: search.query,
    searchFields: search.fields,
    filters,
  })
  
  const orderBy = buildOrderByClause({
    sortBy: req.query.sort,
    sortOrder: req.query.order,
    allowedFields: ['name', 'price', 'created_at'],
  })
  
  await handleList({
    repo: productsRepo,
    req,
    res,
    next,
    filters: { whereClause, params, orderBy },
    dataKey: 'products',
  })
})

// GET by ID
router.get('/api/products/:id', (req, res, next) => {
  handleGetById({
    repo: productsRepo,
    req,
    res,
    next,
    dataKey: 'product',
  })
})

// CREATE
router.post('/api/products', authenticate, validate(createProductSchema), (req, res, next) => {
  handleCreate({
    repo: productsRepo,
    req,
    res,
    next,
    transformData: async (body, req) => ({
      ...body,
      user_id: req.user.id,
      created_at: new Date(),
    }),
    dataKey: 'product',
  })
})

// UPDATE
router.patch('/api/products/:id', authenticate, validate(updateProductSchema), (req, res, next) => {
  handleUpdate({
    repo: productsRepo,
    req,
    res,
    next,
    transformData: async (body, req, existing) => {
      if (existing.user_id !== req.user.id) {
        throw new Error('Forbidden')
      }
      return body
    },
    dataKey: 'product',
  })
})

// DELETE
router.delete('/api/products/:id', authenticate, (req, res, next) => {
  handleDelete({
    repo: productsRepo,
    req,
    res,
    next,
    hardDelete: false,
  })
})

module.exports = router
```

---

## API Reference

See individual files for detailed JSDoc:
- `crud.js` - CRUD handlers
- `search.js` - Search utilities
- `../Middleware/pagination.js` - Pagination middleware

For examples, see:
- `src/api/@custom/todos-example.js` - Full example implementation
