# syntax=docker/dockerfile:1
# Image de production : build du front dans une étape, image d'exécution minimale dans l'autre.
FROM node:22-bookworm-slim AS base

# --- Étape 1 : build (outils de compilation + dépendances de dev) ---
FROM base AS build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# --- Étape 2 : exécution (sans compilateur, sans dépendances de dev) ---
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/data/database.sqlite \
    UPLOADS_PATH=/data/uploads
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Code serveur (migrations et scripts d'exploitation compris) + front buildé.
# Les fichiers appartiennent à root et sont en lecture seule pour l'utilisateur de l'application.
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod 0755 /usr/local/bin/docker-entrypoint.sh && mkdir -p /data/uploads

VOLUME /data
EXPOSE 3001

# Sonde de santé utilisée par Docker et Docker Compose (Fly.io a la sienne dans fly.toml).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Le point d'entrée démarre en root uniquement pour donner le volume /data à
# l'utilisateur « node », puis lance l'application SANS les droits root.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server/index.js"]
