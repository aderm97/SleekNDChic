# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy API package files and install dependencies
COPY apps/api/package*.json ./
RUN npm ci

# Copy Prisma schema and source code
COPY apps/api/prisma ./prisma
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./tsconfig.json

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Install production dependencies and generate Prisma client
RUN npm ci --production
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
