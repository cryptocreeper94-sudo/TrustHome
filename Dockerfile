# TrustHome — Dockerfile for Coolify
# Express server + pre-built Expo static web bundle + PostgreSQL

FROM node:20-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and patches for layer caching
COPY package.json package-lock.json ./
COPY patches/ ./patches/

# Install dependencies (skip postinstall to avoid patch-package PATH issue)
RUN npm ci --legacy-peer-deps --ignore-scripts && npx patch-package || true

# Copy the rest of the source (static-build is pre-built and committed)
COPY . .

# Build the Express server only (static web bundle is pre-built)
RUN npm run server:build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Start production server
ENV NODE_ENV=production
CMD ["node", "server_dist/index.js"]
