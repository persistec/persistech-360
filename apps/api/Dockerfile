# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies as root (correct ownership inside the build layer,
# not a bind-mounted volume — this is the fix for the EACCES issue)
COPY package*.json ./
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

# Copy source and generate Prisma client at build time
# Running as root here is safe because node_modules is baked into the image layer
COPY . .
RUN npx prisma generate
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy build artefacts with correct ownership for the non-root 'node' user
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Run as non-root user to minimise surface area
USER node

EXPOSE 4000

# Apply pending migrations then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
