# Multi-stage build for Taplio Alt (Vite frontend + Express backend)

# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy root package files for the Vite frontend
COPY package*.json ./

# Install all dependencies (including dev deps for build)
RUN npm ci

# Copy frontend source
COPY src/ ./src/
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the frontend
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy server package files and install production deps
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server source
COPY server/src/ ./server/src/

# Copy custom server-side code (@custom routes, db, etc.)
COPY @custom/ ./@custom/

# Copy built frontend from builder stage
# Server expects dist at ../../dist relative to server/src/app.js → /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Expose port (Railway sets PORT env var)
EXPOSE 4000

ENV NODE_ENV=production
# Make server node_modules available to @custom code that requires('express') etc.
ENV NODE_PATH=/app/server/node_modules

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:'+(process.env.PORT||4000)+'/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Start the server
CMD ["node", "server/src/index.js"]
