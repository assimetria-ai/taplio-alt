/**
 * Property Management Routes
 * Task #9680: Property listing core feature
 * 
 * Features:
 * - CRUD operations for properties
 * - Photo upload and management
 * - Full-text search
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db');

const router = express.Router();

// Configure multer for photo uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

/**
 * GET /api/properties
 * List all properties with optional filtering and search
 * 
 * Query params:
 * - q: search query (full-text search)
 * - status: filter by status
 * - type: filter by property_type
 * - min_price: minimum price
 * - max_price: maximum price
 * - city: filter by city
 * - limit: results per page (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const {
      q,
      status,
      type,
      min_price,
      max_price,
      city,
      limit = 50,
      offset = 0
    } = req.query;

    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    // Full-text search
    if (q) {
      query = `
        SELECT p.* FROM properties p
        INNER JOIN properties_fts fts ON p.id = fts.rowid
        WHERE fts MATCH ?
      `;
      params.push(q);
    }

    // Apply filters
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND property_type = ?';
      params.push(type);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    if (min_price) {
      query += ' AND price >= ?';
      params.push(min_price);
    }

    if (max_price) {
      query += ' AND price <= ?';
      params.push(max_price);
    }

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const properties = db.prepare(query).all(...params);

    // Get photos for each property
    const propertiesWithPhotos = properties.map(property => {
      const photos = db.prepare(`
        SELECT id, filename, file_path, is_primary, display_order
        FROM property_photos
        WHERE property_id = ?
        ORDER BY is_primary DESC, display_order ASC
      `).all(property.id);

      return {
        ...property,
        photos
      };
    });

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM properties WHERE 1=1';
    const countParams = [];
    
    if (q) {
      countQuery = `
        SELECT COUNT(*) as total FROM properties p
        INNER JOIN properties_fts fts ON p.id = fts.rowid
        WHERE fts MATCH ?
      `;
      countParams.push(q);
    }

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (type) {
      countQuery += ' AND property_type = ?';
      countParams.push(type);
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({
      data: propertiesWithPhotos,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      error: 'Failed to fetch properties',
      message: error.message
    });
  }
});

/**
 * POST /api/properties
 * Create new property with optional photo upload
 * 
 * Accepts multipart/form-data with:
 * - property data fields
 * - photos: array of image files
 */
router.post('/', upload.array('photos', 10), async (req, res) => {
  try {
    const db = getDb();
    const {
      title,
      description,
      address,
      city,
      state,
      zip_code,
      country = 'USA',
      property_type,
      bedrooms,
      bathrooms,
      square_feet,
      price,
      status = 'available'
    } = req.body;

    // Validate required fields
    if (!title || !address || !city || !state || !zip_code || !property_type) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'address', 'city', 'state', 'zip_code', 'property_type']
      });
    }

    // Insert property
    const insert = db.prepare(`
      INSERT INTO properties (
        title, description, address, city, state, zip_code, country,
        property_type, bedrooms, bathrooms, square_feet, price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      title, description || null, address, city, state, zip_code, country,
      property_type, bedrooms || null, bathrooms || null,
      square_feet || null, price || null, status
    );

    const propertyId = result.lastInsertRowid;

    // Insert photos if uploaded
    if (req.files && req.files.length > 0) {
      const photoInsert = db.prepare(`
        INSERT INTO property_photos (
          property_id, filename, file_path, file_size, mime_type, is_primary, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      req.files.forEach((file, index) => {
        photoInsert.run(
          propertyId,
          file.filename,
          file.path,
          file.size,
          file.mimetype,
          index === 0 ? 1 : 0, // First photo is primary
          index
        );
      });
    }

    // Fetch created property with photos
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId);
    const photos = db.prepare('SELECT * FROM property_photos WHERE property_id = ?').all(propertyId);

    res.status(201).json({
      message: 'Property created successfully',
      data: {
        ...property,
        photos
      }
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error('Error creating property:', error);
    res.status(500).json({
      error: 'Failed to create property',
      message: error.message
    });
  }
});

/**
 * GET /api/properties/:id
 * Get property details including photos
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);

    if (!property) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    const photos = db.prepare(`
      SELECT * FROM property_photos
      WHERE property_id = ?
      ORDER BY is_primary DESC, display_order ASC
    `).all(id);

    res.json({
      data: {
        ...property,
        photos
      }
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      error: 'Failed to fetch property',
      message: error.message
    });
  }
});

/**
 * PUT /api/properties/:id
 * Update property details
 */
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    // Check if property exists
    const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    const {
      title,
      description,
      address,
      city,
      state,
      zip_code,
      country,
      property_type,
      bedrooms,
      bathrooms,
      square_feet,
      price,
      status
    } = req.body;

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (city !== undefined) { updates.push('city = ?'); values.push(city); }
    if (state !== undefined) { updates.push('state = ?'); values.push(state); }
    if (zip_code !== undefined) { updates.push('zip_code = ?'); values.push(zip_code); }
    if (country !== undefined) { updates.push('country = ?'); values.push(country); }
    if (property_type !== undefined) { updates.push('property_type = ?'); values.push(property_type); }
    if (bedrooms !== undefined) { updates.push('bedrooms = ?'); values.push(bedrooms); }
    if (bathrooms !== undefined) { updates.push('bathrooms = ?'); values.push(bathrooms); }
    if (square_feet !== undefined) { updates.push('square_feet = ?'); values.push(square_feet); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No fields to update'
      });
    }

    const query = `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    db.prepare(query).run(...values);

    // Fetch updated property
    const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id);
    const photos = db.prepare('SELECT * FROM property_photos WHERE property_id = ?').all(id);

    res.json({
      message: 'Property updated successfully',
      data: {
        ...property,
        photos
      }
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      error: 'Failed to update property',
      message: error.message
    });
  }
});

/**
 * DELETE /api/properties/:id
 * Delete property and associated photos
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    // Get photos before deletion to clean up files
    const photos = db.prepare('SELECT file_path FROM property_photos WHERE property_id = ?').all(id);

    // Delete property (CASCADE will delete photos from DB)
    const result = db.prepare('DELETE FROM properties WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    // Delete photo files from filesystem
    photos.forEach(photo => {
      if (fs.existsSync(photo.file_path)) {
        fs.unlinkSync(photo.file_path);
      }
    });

    res.json({
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      error: 'Failed to delete property',
      message: error.message
    });
  }
});

/**
 * POST /api/properties/:id/photos
 * Add photos to existing property
 */
router.post('/:id/photos', upload.array('photos', 10), async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    // Check if property exists
    const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(id);
    if (!property) {
      // Clean up uploaded files
      if (req.files) {
        req.files.forEach(file => fs.unlinkSync(file.path));
      }
      
      return res.status(404).json({
        error: 'Property not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No photos uploaded'
      });
    }

    // Get current max display order
    const maxOrder = db.prepare(`
      SELECT COALESCE(MAX(display_order), -1) as max_order
      FROM property_photos
      WHERE property_id = ?
    `).get(id);

    const photoInsert = db.prepare(`
      INSERT INTO property_photos (
        property_id, filename, file_path, file_size, mime_type, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertedPhotos = [];
    req.files.forEach((file, index) => {
      const result = photoInsert.run(
        id,
        file.filename,
        file.path,
        file.size,
        file.mimetype,
        maxOrder.max_order + index + 1
      );
      insertedPhotos.push(result.lastInsertRowid);
    });

    // Fetch inserted photos
    const photos = db.prepare(`
      SELECT * FROM property_photos
      WHERE id IN (${insertedPhotos.map(() => '?').join(',')})
    `).all(...insertedPhotos);

    res.status(201).json({
      message: 'Photos uploaded successfully',
      data: photos
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    console.error('Error uploading photos:', error);
    res.status(500).json({
      error: 'Failed to upload photos',
      message: error.message
    });
  }
});

/**
 * DELETE /api/properties/:id/photos/:photoId
 * Delete a specific photo
 */
router.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    const db = getDb();
    const { id, photoId } = req.params;

    // Get photo to delete file
    const photo = db.prepare(`
      SELECT file_path FROM property_photos
      WHERE id = ? AND property_id = ?
    `).get(photoId, id);

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found'
      });
    }

    // Delete from database
    db.prepare('DELETE FROM property_photos WHERE id = ?').run(photoId);

    // Delete file from filesystem
    if (fs.existsSync(photo.file_path)) {
      fs.unlinkSync(photo.file_path);
    }

    res.json({
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      error: 'Failed to delete photo',
      message: error.message
    });
  }
});

module.exports = router;
