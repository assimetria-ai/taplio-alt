# Nestora Property Listing API

**Task #9680**: Property listing core feature with CRUD, photo upload, and search

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### Properties

#### List Properties
```http
GET /api/properties
```

**Query Parameters:**
- `q` (string): Full-text search query
- `status` (string): Filter by status (available, rented, sold, pending, off_market)
- `type` (string): Filter by property type (house, apartment, condo, townhouse, commercial, land, other)
- `city` (string): Filter by city
- `min_price` (number): Minimum price
- `max_price` (number): Maximum price
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Example:**
```bash
# Get all available properties
GET /api/properties?status=available

# Search for apartments in San Francisco
GET /api/properties?q=modern&type=apartment&city=San%20Francisco

# Price range filter
GET /api/properties?min_price=200000&max_price=500000
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Modern Downtown Apartment",
      "description": "Beautiful 2BR apartment...",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94102",
      "country": "USA",
      "property_type": "apartment",
      "bedrooms": 2,
      "bathrooms": 2,
      "square_feet": 1200,
      "price": 450000,
      "status": "available",
      "created_at": "2026-03-08T20:00:00Z",
      "updated_at": "2026-03-08T20:00:00Z",
      "photos": [
        {
          "id": 1,
          "filename": "property-123456.jpg",
          "file_path": "/path/to/uploads/property-123456.jpg",
          "is_primary": 1,
          "display_order": 0
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Create Property
```http
POST /api/properties
Content-Type: multipart/form-data
```

**Form Fields:**
- `title` (required): Property title
- `address` (required): Street address
- `city` (required): City
- `state` (required): State/Province
- `zip_code` (required): ZIP/Postal code
- `property_type` (required): Type (house, apartment, condo, townhouse, commercial, land, other)
- `description` (optional): Property description
- `country` (optional): Country (default: USA)
- `bedrooms` (optional): Number of bedrooms
- `bathrooms` (optional): Number of bathrooms
- `square_feet` (optional): Square footage
- `price` (optional): Price
- `status` (optional): Status (default: available)
- `photos` (optional): Array of image files (max 10, 10MB each)

**Example (using curl):**
```bash
curl -X POST http://localhost:3001/api/properties \
  -F "title=Beautiful Family Home" \
  -F "description=Spacious 4BR house in quiet neighborhood" \
  -F "address=456 Oak Street" \
  -F "city=Portland" \
  -F "state=OR" \
  -F "zip_code=97201" \
  -F "property_type=house" \
  -F "bedrooms=4" \
  -F "bathrooms=3" \
  -F "square_feet=2500" \
  -F "price=650000" \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg"
```

**Response:**
```json
{
  "message": "Property created successfully",
  "data": {
    "id": 2,
    "title": "Beautiful Family Home",
    // ... property details
    "photos": [
      {
        "id": 2,
        "property_id": 2,
        "filename": "property-987654.jpg",
        "is_primary": 1,
        "display_order": 0
      }
    ]
  }
}
```

#### Get Property Details
```http
GET /api/properties/:id
```

**Example:**
```bash
GET /api/properties/1
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "Modern Downtown Apartment",
    // ... all property fields
    "photos": [...]
  }
}
```

#### Update Property
```http
PUT /api/properties/:id
Content-Type: application/json
```

**Body:** (all fields optional, only include fields to update)
```json
{
  "title": "Updated Title",
  "price": 475000,
  "status": "pending"
}
```

**Response:**
```json
{
  "message": "Property updated successfully",
  "data": {
    // updated property details
  }
}
```

#### Delete Property
```http
DELETE /api/properties/:id
```

**Example:**
```bash
DELETE /api/properties/1
```

**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

### Photo Management

#### Add Photos to Property
```http
POST /api/properties/:id/photos
Content-Type: multipart/form-data
```

**Form Fields:**
- `photos`: Array of image files (max 10)

**Example:**
```bash
curl -X POST http://localhost:3001/api/properties/1/photos \
  -F "photos=@/path/to/photo3.jpg" \
  -F "photos=@/path/to/photo4.jpg"
```

**Response:**
```json
{
  "message": "Photos uploaded successfully",
  "data": [
    {
      "id": 3,
      "property_id": 1,
      "filename": "property-111222.jpg",
      "display_order": 2
    }
  ]
}
```

#### Delete Photo
```http
DELETE /api/properties/:id/photos/:photoId
```

**Example:**
```bash
DELETE /api/properties/1/photos/3
```

**Response:**
```json
{
  "message": "Photo deleted successfully"
}
```

## Search Features

The API supports full-text search using SQLite FTS5:

### Search Query Examples

```bash
# Simple keyword search
GET /api/properties?q=modern

# Multiple keywords (AND logic)
GET /api/properties?q=modern+apartment

# Phrase search
GET /api/properties?q="downtown+location"

# Combined search and filters
GET /api/properties?q=spacious&type=house&city=Portland&min_price=500000
```

### Searchable Fields

Full-text search covers:
- Title
- Description
- Address
- City
- State

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

## Photo Upload

### Accepted Formats
- JPEG/JPG
- PNG
- GIF
- WebP

### Limits
- Max file size: 10MB per image
- Max files per upload: 10 images

### Photo Storage

- Photos are stored in the `uploads/` directory
- Accessible via: `http://localhost:3001/uploads/{filename}`
- First uploaded photo automatically becomes primary

## Development

### Start the API Server

```bash
cd products/nestora/@custom
npm install
npm run init-db  # Initialize database (first time only)
npm start        # Start server on port 3001
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Environment Variables

```bash
PORT=3001                           # Server port
DATABASE_PATH=./nestora.db          # SQLite database path
UPLOAD_DIR=./uploads                # Photo upload directory
NODE_ENV=development                # Environment
```

## Database Schema

### Properties Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| title | TEXT | Property title (required) |
| description | TEXT | Property description |
| address | TEXT | Street address (required) |
| city | TEXT | City (required) |
| state | TEXT | State/Province (required) |
| zip_code | TEXT | ZIP/Postal code (required) |
| country | TEXT | Country (default: USA) |
| property_type | TEXT | Type (enum) |
| bedrooms | INTEGER | Number of bedrooms |
| bathrooms | INTEGER | Number of bathrooms |
| square_feet | INTEGER | Square footage |
| price | DECIMAL | Price |
| status | TEXT | Status (enum, default: available) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Property Photos Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| property_id | INTEGER | Foreign key to properties |
| filename | TEXT | File name |
| file_path | TEXT | Full file path |
| file_size | INTEGER | File size in bytes |
| mime_type | TEXT | MIME type |
| is_primary | BOOLEAN | Primary photo flag |
| display_order | INTEGER | Display order |
| created_at | DATETIME | Upload timestamp |

---

**Task #9680 Implementation**
- ✅ Create listing
- ✅ Read/List listings
- ✅ Update listing  
- ✅ Delete listing
- ✅ Upload photos
- ✅ Search functionality (full-text)
