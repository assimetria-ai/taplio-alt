# Splice Deployment Guide

## Frontend Build & Deployment

### Build Process

1. **Build the client:**
   ```bash
   cd products/splice/client
   npm install
   npm run build
   ```
   This creates `client/dist/` with the compiled React application.

2. **Copy to server public directory:**
   ```bash
   cd products/splice
   cp -r client/dist server/public
   ```
   The server expects static files in `server/public/` (configured in `server/src/app.js`).

3. **Start server in production mode:**
   ```bash
   cd products/splice/server
   NODE_ENV=production npm start
   ```

### Server Static File Configuration

The server serves static files from `server/public/` only when:
- `NODE_ENV=production` is set
- The `public/` directory exists

See `server/src/app.js`:
```javascript
const publicDir = path.join(__dirname, '..', 'public')
if (process.env.NODE_ENV === 'production' && fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
}
```

### .gitignore

The `server/public/` directory is in `.gitignore` because it contains build artifacts that should be generated during deployment, not committed to git.

### Railway Deployment

For Railway deployment, add a build script that:
1. Builds the client
2. Copies dist to server/public
3. Starts the server

Example `package.json` script:
```json
{
  "scripts": {
    "deploy": "cd client && npm install && npm run build && cd .. && cp -r client/dist server/public && cd server && npm install && npm start"
  }
}
```

### Development

In development mode (`NODE_ENV` not set to production), the server returns 404 for non-API routes. Run the client separately:
```bash
# Terminal 1 - Server
cd products/splice/server
npm run dev

# Terminal 2 - Client
cd products/splice/client
npm run dev
```

The client dev server (Vite) proxies API requests to the backend.

## Troubleshooting

### Issue: 404 for /assets/index-*.js

**Symptoms:**
- Blank page when accessing the app
- Browser console shows 404 errors for JS bundles

**Causes:**
1. Client not built: `client/dist/` doesn't exist
2. Build not copied: `server/public/` doesn't exist
3. Wrong environment: `NODE_ENV` not set to `production`

**Solution:**
```bash
cd products/splice
cd client && npm run build && cd ..
cp -r client/dist server/public
cd server && NODE_ENV=production npm start
```

### Issue: Build succeeds but files missing

Check that you're copying to the correct location:
```bash
$ ls server/public/
assets/      index.html

$ ls server/public/assets/ | grep "index-.*\.js"
index-BeNt-toD.js  # ✅ Main bundle exists
```

## Architecture

```
products/splice/
├── client/                 # React frontend (Vite)
│   ├── src/
│   ├── dist/              # Build output (gitignored)
│   ├── vite.config.js
│   └── package.json
│
└── server/                # Express backend
    ├── src/
    │   ├── app.js        # Static file serving configured here
    │   └── index.js      # Server entry point
    ├── public/           # Static files served in production (gitignored)
    │   ├── assets/
    │   └── index.html
    └── package.json
```

---

**Created:** 2026-03-08  
**Task:** #9400 - Fixing frontend JS bundle 404 issue
