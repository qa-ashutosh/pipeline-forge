# ─────────────────────────────────────────────────────────────────────────────
# Build context: REPO ROOT (not this service directory)
# docker-compose sets: context: .  (repo root)
# This is required because npm workspaces stores one package-lock.json at root.
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: base — Node 24 LTS Alpine with dumb-init
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: dependencies — install from root workspace lock file
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS dependencies

COPY package.json package-lock.json ./
COPY services/users-api/package.json ./services/users-api/package.json

RUN npm ci --workspace=services/users-api --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: development — hot-reload via ts-node-dev
# ─────────────────────────────────────────────────────────────────────────────
FROM dependencies AS development

ENV NODE_ENV=development
ENV PORT=3001

COPY services/users-api/tsconfig.json ./services/users-api/tsconfig.json
COPY services/users-api/src ./services/users-api/src

WORKDIR /app/services/users-api

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: builder — compile TypeScript
# ─────────────────────────────────────────────────────────────────────────────
FROM dependencies AS builder

COPY services/users-api/tsconfig.json ./services/users-api/tsconfig.json
COPY services/users-api/src ./services/users-api/src

WORKDIR /app/services/users-api

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 5: production — minimal runtime image
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json ./
COPY services/users-api/package.json ./services/users-api/package.json

RUN npm ci --workspace=services/users-api --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --from=builder /app/services/users-api/dist ./services/users-api/dist

RUN chown -R nodejs:nodejs /app
USER nodejs

WORKDIR /app/services/users-api

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/v1/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
