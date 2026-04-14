# ─────────────────────────────────────────────────────────────────────────────
# Build context: REPO ROOT (not this service directory)
# docker-compose sets: context: .  (repo root)
# This is required because npm workspaces stores one package-lock.json at root.
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: base
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM base AS dependencies

COPY package.json package-lock.json ./
COPY services/orders-api/package.json ./services/orders-api/package.json

RUN npm ci --workspace=services/orders-api --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: development
# ─────────────────────────────────────────────────────────────────────────────
FROM dependencies AS development

ENV NODE_ENV=development
ENV PORT=3002

COPY services/orders-api/tsconfig.json ./services/orders-api/tsconfig.json
COPY services/orders-api/src ./services/orders-api/src

WORKDIR /app/services/orders-api

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 4: builder
# ─────────────────────────────────────────────────────────────────────────────
FROM dependencies AS builder

COPY services/orders-api/tsconfig.json ./services/orders-api/tsconfig.json
COPY services/orders-api/src ./services/orders-api/src

WORKDIR /app/services/orders-api

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 5: production
# ─────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS production

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json ./
COPY services/orders-api/package.json ./services/orders-api/package.json

RUN npm ci --workspace=services/orders-api --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --from=builder /app/services/orders-api/dist ./services/orders-api/dist

RUN chown -R nodejs:nodejs /app
USER nodejs

WORKDIR /app/services/orders-api

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3002/api/v1/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
