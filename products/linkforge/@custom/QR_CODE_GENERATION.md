# QR Code Generation for Short Links
**Task #10313 - Implement QR code generation for short links**

## Overview

LinkForge now supports automatic QR code generation for all short links. Generate QR codes in PNG or SVG format with customizable size, colors, and margins.

## Features

✅ **Multiple Formats** - Generate QR codes as PNG or SVG  
✅ **Customizable** - Control size, colors, margin, and error correction  
✅ **Download or Display** - Force download or display inline  
✅ **Batch Generation** - Generate QR codes for multiple links at once  
✅ **Data URL Preview** - Get base64 data URLs for embedding  
✅ **Dashboard Integration** - One-click QR code download from dashboard  

## API Endpoints

### 1. Generate QR Code

```
GET /api/qrcode/:slug
```

Generate a QR code for a short link.

**Path Parameters:**
- `slug` (string, required) - The short link slug

**Query Parameters:**
- `format` (string, optional) - Output format: `png` (default) or `svg`
- `size` (number, optional) - Size in pixels: 50-2000 (default: 300)
- `margin` (number, optional) - Margin in modules: 0-10 (default: 4)
- `color` (string, optional) - Dark color hex code (default: `#000000`)
- `bgcolor` (string, optional) - Light color hex code (default: `#ffffff`)
- `download` (string, optional) - Force download: `1` or `0` (default: `0`)

**Response:**
- PNG image (`image/png`) or SVG image (`image/svg+xml`)
- Content-Disposition header for download or inline display

**Examples:**

```bash
# Generate default PNG QR code
GET /api/qrcode/promo

# Generate SVG QR code
GET /api/qrcode/promo?format=svg

# Generate large PNG with custom colors
GET /api/qrcode/promo?size=800&color=%23FF0000&bgcolor=%23FFFF00

# Force download as PNG
GET /api/qrcode/promo?download=1
```

**Use in HTML:**

```html
<!-- Display inline -->
<img src="/api/qrcode/promo?size=200" alt="QR Code" />

<!-- Custom styled QR code -->
<img src="/api/qrcode/promo?size=400&color=%23667eea&bgcolor=%23f3f4f6" />

<!-- SVG (scalable) -->
<img src="/api/qrcode/promo?format=svg&size=300" alt="QR Code" />
```

**Direct Download Link:**

```html
<a href="/api/qrcode/promo?download=1" target="_blank">
  Download QR Code
</a>
```

---

### 2. QR Code Preview (Data URL)

```
GET /api/qrcode/preview/:slug
```

Generate a QR code as a base64 data URL for embedding in JSON responses or HTML.

**Path Parameters:**
- `slug` (string, required) - The short link slug

**Query Parameters:**
- `size` (number, optional) - Size in pixels: 50-2000 (default: 300)
- `margin` (number, optional) - Margin in modules: 0-10 (default: 4)
- `color` (string, optional) - Dark color hex code (default: `#000000`)
- `bgcolor` (string, optional) - Light color hex code (default: `#ffffff`)

**Response:**
```json
{
  "slug": "promo",
  "shortUrl": "https://lnk.fg/promo",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "size": 300,
  "format": "png"
}
```

**Example:**

```bash
curl http://localhost:3000/api/qrcode/preview/promo?size=400
```

**Use in Frontend:**

```javascript
// Fetch QR code data URL
const response = await fetch('/api/qrcode/preview/promo?size=300');
const data = await response.json();

// Display in img tag
document.getElementById('qr').src = data.qrCode;
```

```html
<img id="qr" alt="QR Code" />
```

---

### 3. Batch QR Code Generation

```
POST /api/qrcode/batch
```

Generate QR codes for multiple links in one request.

**Request Body:**
```json
{
  "slugs": ["promo", "sale", "offer"],
  "size": 300,
  "margin": 4,
  "color": "#000000",
  "bgcolor": "#ffffff"
}
```

**Parameters:**
- `slugs` (string[], required) - Array of slugs (max 50)
- `size` (number, optional) - Size in pixels (default: 300)
- `margin` (number, optional) - Margin in modules (default: 4)
- `color` (string, optional) - Dark color hex code (default: `#000000`)
- `bgcolor` (string, optional) - Light color hex code (default: `#ffffff`)

**Response:**
```json
{
  "success": true,
  "generated": 3,
  "results": [
    {
      "slug": "promo",
      "shortUrl": "https://lnk.fg/promo",
      "qrCode": "data:image/png;base64,..."
    },
    {
      "slug": "sale",
      "shortUrl": "https://lnk.fg/sale",
      "qrCode": "data:image/png;base64,..."
    },
    {
      "slug": "offer",
      "shortUrl": "https://lnk.fg/offer",
      "qrCode": "data:image/png;base64,..."
    }
  ],
  "missing": []
}
```

**Example:**

```javascript
const response = await fetch('/api/qrcode/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    slugs: ['promo', 'sale', 'offer'],
    size: 400
  })
});

const data = await response.json();
data.results.forEach(item => {
  console.log(`${item.slug}: ${item.shortUrl}`);
});
```

---

## QR Code Parameters

### Size

Controls the width and height of the QR code in pixels.

- **Range:** 50 - 2000 pixels
- **Default:** 300 pixels
- **Recommended:** 
  - Small (web preview): 200-300px
  - Medium (print): 400-600px
  - Large (poster/banner): 800-1200px

```bash
# Small
GET /api/qrcode/promo?size=200

# Medium
GET /api/qrcode/promo?size=500

# Large
GET /api/qrcode/promo?size=1000
```

### Margin

White space border around the QR code (measured in QR code modules).

- **Range:** 0 - 10 modules
- **Default:** 4 modules
- **Recommended:** 2-4 modules (standard is 4)

```bash
# Tight margin
GET /api/qrcode/promo?margin=1

# Standard margin
GET /api/qrcode/promo?margin=4

# Extra margin
GET /api/qrcode/promo?margin=8
```

### Colors

Customize the dark (foreground) and light (background) colors.

- **Format:** Hex color codes (with or without #)
- **Default:** Dark: `#000000`, Light: `#ffffff`
- **Tips:**
  - Ensure high contrast for reliability
  - Test with actual QR scanners before production
  - Avoid very light dark colors or very dark light colors

```bash
# Brand colors (purple on light gray)
GET /api/qrcode/promo?color=%23667eea&bgcolor=%23f3f4f6

# Red on white
GET /api/qrcode/promo?color=%23FF0000&bgcolor=%23FFFFFF

# Blue on yellow
GET /api/qrcode/promo?color=%230000FF&bgcolor=%23FFFF00
```

### Format

Choose between PNG (raster) or SVG (vector).

**PNG:**
- Raster format (pixel-based)
- Best for: web display, social media, emails
- File size: Larger for high resolution
- Scaling: Loses quality when enlarged

**SVG:**
- Vector format (scalable)
- Best for: print materials, logos, large displays
- File size: Small and consistent
- Scaling: Perfect quality at any size

```bash
# PNG (default)
GET /api/qrcode/promo?format=png

# SVG
GET /api/qrcode/promo?format=svg
```

---

## Dashboard Integration

### One-Click Download

The links table includes a QR code button for each link:

1. **Purple QR Icon** - Click to download QR code
2. **Automatic Format** - Downloads as PNG by default
3. **Optimized Size** - 500x500px for good print/display quality

**Implementation in LinksTable.jsx:**

```javascript
// Download QR code
const downloadQRCode = async (link, format = 'png') => {
  try {
    const url = `/api/qrcode/${link.slug}?format=${format}&size=500&download=1`;
    window.open(url, '_blank');
  } catch (err) {
    console.error('Failed to download QR code:', err);
  }
};
```

**UI Button:**

```jsx
<button
  onClick={() => downloadQRCode(link, 'png')}
  className="p-2 hover:bg-purple-50 text-purple-600 rounded transition-colors"
  title="Download QR code"
>
  <QrCodeIcon className="w-4 h-4" />
</button>
```

---

## Use Cases

### 1. Print Materials

Generate high-resolution QR codes for business cards, flyers, posters:

```bash
# High resolution PNG for print (600 DPI equivalent)
GET /api/qrcode/promo?size=1200&margin=4&download=1

# Or use SVG for perfect print quality
GET /api/qrcode/promo?format=svg&download=1
```

### 2. Website Embedding

Embed QR codes directly in web pages:

```html
<div class="qr-container">
  <img src="/api/qrcode/promo?size=300" alt="Scan for promo" />
  <p>Scan to visit our sale</p>
</div>
```

### 3. Email Campaigns

Use data URLs to embed QR codes in emails:

```javascript
// Fetch QR as data URL
const response = await fetch('/api/qrcode/preview/promo?size=300');
const { qrCode } = await response.json();

// Use in email HTML
const emailHtml = `
  <img src="${qrCode}" alt="QR Code" />
  <p>Scan to access your exclusive offer!</p>
`;
```

### 4. Batch Export

Generate QR codes for all links:

```javascript
// Get all link slugs
const linksResponse = await fetch('/api/links');
const { links } = await linksResponse.json();
const slugs = links.map(link => link.slug);

// Generate QR codes
const qrResponse = await fetch('/api/qrcode/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slugs, size: 500 })
});

const { results } = await qrResponse.json();

// Download or process each QR code
results.forEach(item => {
  // Display or save item.qrCode (data URL)
});
```

### 5. Social Media Graphics

Create branded QR codes for Instagram, Twitter, Facebook:

```bash
# Instagram post (square, branded colors)
GET /api/qrcode/promo?size=1080&color=%23E1306C&bgcolor=%23FAFAFA

# Twitter (brand blue)
GET /api/qrcode/promo?size=800&color=%231DA1F2&bgcolor=%23FFFFFF
```

---

## Error Handling

### Error Responses

All errors return JSON with descriptive messages:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Errors

**404 - Link Not Found**
```json
{
  "error": "Link not found",
  "slug": "nonexistent"
}
```

**400 - Invalid Format**
```json
{
  "error": "Invalid format. Use \"png\" or \"svg\""
}
```

**400 - Invalid Size**
```json
{
  "error": "Size must be between 50 and 2000 pixels"
}
```

**400 - Invalid Margin**
```json
{
  "error": "Margin must be between 0 and 10"
}
```

**400 - Too Many Slugs (Batch)**
```json
{
  "error": "Maximum 50 slugs per request"
}
```

**500 - Generation Failed**
```json
{
  "error": "Failed to generate QR code",
  "message": "Detailed error from QR library"
}
```

---

## Technical Details

### QR Code Library

Uses `qrcode` npm package (v1.5.3):
- Supports PNG, SVG, and data URLs
- Error correction level: M (medium, 15% recovery)
- Encoding: UTF-8

### Error Correction Levels

Current implementation uses **Level M** (Medium):
- Recovers up to ~15% of damaged data
- Good balance between size and reliability
- Recommended for most use cases

Available levels (not currently configurable):
- L (Low): ~7% recovery
- M (Medium): ~15% recovery ✅ **Current**
- Q (Quartile): ~25% recovery
- H (High): ~30% recovery

### Custom Domain Support

QR codes automatically include custom domains:

```
Link: https://go.brand.com/promo
QR Code encodes: https://go.brand.com/promo

Link: https://linkforge.app/promo
QR Code encodes: https://linkforge.app/promo
```

### SSL Detection

QR codes respect SSL status:
- Custom domain with SSL active → `https://`
- Custom domain without SSL → `http://`
- Primary domain → `http://` (or `https://` based on request)

---

## Best Practices

### 1. Size Selection

**Web Display:**
- 200-300px for thumbnails
- 300-400px for modal/lightbox
- 400-600px for full-page display

**Print:**
- Use SVG for best quality
- Or PNG at 600+ DPI equivalent
- Minimum physical size: 2cm x 2cm (0.8" x 0.8")

### 2. Color Contrast

- **High Contrast** - Essential for scanner reliability
- **Test First** - Always test with actual QR scanners
- **Avoid** - Light colors on light backgrounds
- **Safe Choices** - Black on white, dark blue on light gray

### 3. Placement

- **Good Lighting** - Place where users can scan easily
- **Flat Surface** - Avoid curved or textured surfaces
- **Eye Level** - Comfortable scanning height
- **Call to Action** - Add text: "Scan for..." "Point camera here"

### 4. Testing

Before deploying QR codes:
1. Test with multiple scanner apps (iOS Camera, Android, dedicated apps)
2. Test in different lighting conditions
3. Test at the actual physical size (for print)
4. Test with brand colors (not just black/white)
5. Verify the destination URL is correct

---

## Performance

### Caching

QR code images are generated on-demand (not cached). Consider:
- CDN caching for frequently accessed QR codes
- Client-side caching with service workers
- Pre-generating QR codes for critical links

### Rate Limiting

Consider implementing rate limits for:
- Individual QR code requests: 100/minute per IP
- Batch generation: 10/minute per user
- Preview endpoint: 50/minute per IP

### Optimization

- Small sizes (≤300px) generate in ~10-50ms
- Large sizes (≥1000px) generate in ~50-200ms
- SVG generation is faster than PNG
- Batch requests process in parallel

---

## Future Enhancements

### Planned Features

1. **QR Code Templates** - Pre-designed branded templates
2. **Logo Overlay** - Add logo/icon in center of QR code
3. **Custom Shapes** - Rounded corners, circular QR codes
4. **Analytics** - Track QR code scans separately
5. **Dynamic QR** - Update destination without regenerating
6. **Bulk Export** - ZIP file with all QR codes
7. **Print-Ready PDF** - Generate print sheet with multiple QR codes
8. **A/B Testing** - Different QR styles, track which performs better

### Advanced Customization

Future parameters:
- `errorCorrection`: L, M, Q, H
- `dotType`: square, rounded, dots
- `cornerType`: square, rounded, extra-rounded
- `logo`: URL to logo image for center overlay
- `gradient`: Enable gradient colors

---

## Dependencies

### Backend

```json
{
  "qrcode": "^1.5.3"
}
```

### Frontend (Dashboard)

```javascript
import { QrCodeIcon } from '@heroicons/react/24/outline';
```

---

## Summary

**Task #10313 Complete** ✅

Delivered:
- ✅ QR code generation API endpoint
- ✅ PNG and SVG format support
- ✅ Customizable size, colors, margin
- ✅ Download or inline display
- ✅ Data URL preview endpoint
- ✅ Batch generation endpoint
- ✅ Dashboard integration (one-click download)
- ✅ Custom domain support
- ✅ Comprehensive documentation

QR code generation is now fully integrated into LinkForge, ready for use in print materials, websites, emails, and marketing campaigns.

---

**Implementation Date:** March 10, 2024  
**Task ID:** #10313  
**Feature:** QR Code Generation  
**Status:** ✅ Complete
