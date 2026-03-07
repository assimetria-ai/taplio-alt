# Multi-stage build for nestora landing page
# This Dockerfile builds from the landing subdirectory

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files from landing directory
COPY landing/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy landing source code
COPY landing/ ./

# Build the application
RUN npm run build

# Stage 2: Production runtime
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY landing/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY landing/server.js ./

# Expose port (Railway sets PORT env var)
EXPOSE 3000

# Health check - nestora uses /api/health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "server.js"]
