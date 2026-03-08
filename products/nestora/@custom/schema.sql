-- Nestora Property Listing Database Schema
-- Task #9680: Property listing core feature with CRUD, photo upload, and search

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  property_type TEXT NOT NULL CHECK(property_type IN ('house', 'apartment', 'condo', 'townhouse', 'commercial', 'land', 'other')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  price DECIMAL(12, 2),
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'rented', 'sold', 'pending', 'off_market')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Property photos table
CREATE TABLE IF NOT EXISTS property_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_primary BOOLEAN DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Full-text search support (for SQLite)
CREATE VIRTUAL TABLE IF NOT EXISTS properties_fts USING fts5(
  title,
  description,
  address,
  city,
  state,
  content=properties,
  content_rowid=id
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS properties_ai AFTER INSERT ON properties BEGIN
  INSERT INTO properties_fts(rowid, title, description, address, city, state)
  VALUES (new.id, new.title, new.description, new.address, new.city, new.state);
END;

CREATE TRIGGER IF NOT EXISTS properties_ad AFTER DELETE ON properties BEGIN
  DELETE FROM properties_fts WHERE rowid = old.id;
END;

CREATE TRIGGER IF NOT EXISTS properties_au AFTER UPDATE ON properties BEGIN
  UPDATE properties_fts SET
    title = new.title,
    description = new.description,
    address = new.address,
    city = new.city,
    state = new.state
  WHERE rowid = old.id;
END;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_property_photos_property ON property_photos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_photos_primary ON property_photos(property_id, is_primary);

-- Update trigger for updated_at
CREATE TRIGGER IF NOT EXISTS properties_update_timestamp 
AFTER UPDATE ON properties
FOR EACH ROW
BEGIN
  UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
