# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base

# better-sqlite3 native build needs python + make + g++
FROM base AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# --- Runtime image (small) ---
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/data/database.sqlite \
    UPLOADS_PATH=/data/uploads
WORKDIR /app

# Only prod deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# App code + built frontend
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist

# Volume mount point
RUN mkdir -p /data/uploads
VOLUME /data

EXPOSE 3001
CMD ["node", "server/index.js"]
