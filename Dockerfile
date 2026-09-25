# TrustHome — Dockerfile for Coolify
# Express server + Expo static web build + PostgreSQL

FROM node:20-slim

WORKDIR /app

# Install system deps needed by Expo/Metro build
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ git curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy patches and apply
COPY patches/ ./patches/
RUN npx patch-package || true

# Copy the rest of the source
COPY . .

# Build the Expo static web bundle
RUN npm run expo:static:build

# Build the Express server
RUN npm run server:build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Start production server
ENV NODE_ENV=production
CMD ["node", "server_dist/index.js"]
