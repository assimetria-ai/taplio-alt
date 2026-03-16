# ─────────────────────────────────────────────────────────────────────────────
#  taplio-alt — Dockerfile  (multi-stage, production-ready)
#
#  This product uses a root-level Vite frontend (not client/ subfolder).
#  Structure: root = Vite React app, server/ = Express backend.
#
#  Usage:
#    docker build -t taplio-alt .
#    docker run -p 4000:4000 --env-file .env taplio-alt
#
#  Build targets:
#    --target frontend-build  → only Vite build (CI cache layer)
#    --target server-deps     → only production server deps (CI cache layer)
#    --target runner           → final production image (default)
# ─────────────────────────────────────────────────────────────────────────────

# ── Shared base ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
ARG CACHEBUST=1
RUN apk add --no-cache tini postgresql-client

# ── Stage 1: frontend build (Vite at root level) ─────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Manifests first → better layer caching
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy frontend source + config
COPY src/ ./src/
COPY index.html ./
COPY vite.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY public/ ./public/

# Accept API URL at build time; defaults to relative path (same host)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ── Stage 2: server production dependencies ───────────────────────────────────
FROM base AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# ── Stage 3: final runner ─────────────────────────────────────────────────────
FROM base AS runner

WORKDIR /app

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Server production deps
COPY --from=server-deps /app/server/node_modules ./server/node_modules

# Server source
COPY server/src/ ./server/src/
COPY server/package.json server/package-lock.json ./server/

# Built frontend assets → served by Express as static files
COPY --from=frontend-build /app/dist ./server/public

RUN chown -R appuser:appgroup /app
USER appuser

ENV NODE_ENV=production \
    PORT=4000

EXPOSE 4000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/src/db/migrations/@system/start.js"]
