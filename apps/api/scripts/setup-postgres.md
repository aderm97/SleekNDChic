# PostgreSQL Migration Guide

## Overview
This guide helps you migrate from SQLite to PostgreSQL for production use.

## Prerequisites
- PostgreSQL installed locally OR Docker Desktop running
- Node.js and npm installed

## Option 1: Using Docker (Recommended for Development)

### Start Docker Desktop
1. Open Docker Desktop application
2. Wait for it to fully start

### Start PostgreSQL Container
```bash
cd apps/api
docker-compose up -d postgres
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### Verify Connection
```bash
docker exec -it sleekndchic-postgres psql -U postgres -d sleekndchic -c "\dt"
```

## Option 2: Local PostgreSQL Installation

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer with default settings
3. Set password for `postgres` user
4. Open pgAdmin or psql and create database:
   ```sql
   CREATE DATABASE sleekndchic;
   ```

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
createdb sleekndchic
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb sleekndchic
```

## Migration Steps

### 1. Backup SQLite Data (Already Done)
```bash
copy prisma\dev.db prisma\dev.db.backup
```

### 2. Schema Changes (Already Done)
The `schema.prisma` has been updated to use PostgreSQL provider:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Update Environment Variables (Already Done)
The `.env` file has been updated:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sleekndchic?schema=public"
```

**Adjust if needed:**
- Default user: `postgres`
- Default password: `postgres`
- Default database: `sleekndchic`
- Default port: `5432`

### 4. Install PostgreSQL Dependencies
```bash
cd apps/api
npm install @prisma/adapter-pg pg
```

### 5. Create Database Migration
```bash
# Remove old migrations (SQLite-specific)
rimraf prisma/migrations

# Create new migration for PostgreSQL
npx prisma migrate dev --name init_postgres
```

### 6. Migrate Data from SQLite
```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run migration script
npx ts-node scripts/migrate-to-postgres.ts
```

### 7. Verify Migration
```bash
# Check database tables
npx prisma studio
```

### 8. Test Application
```bash
# Start the API
npm run dev

# In another terminal, test endpoints
curl http://localhost:3000/api/v1/products
```

## Troubleshooting

### Connection Refused
- Check if PostgreSQL is running: `docker ps` or `brew services list`
- Verify port 5432 is not blocked by firewall
- Check DATABASE_URL format

### Migration Fails
- Ensure SQLite database exists at `prisma/dev.db`
- Check that both databases are accessible
- Review error messages for specific table issues

### Prisma Client Issues
```bash
# Regenerate client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Production Deployment

### Environment Variables
Set these in your production environment:
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

### Connection Pooling (Recommended)
For production, use connection pooling:
```env
# Direct connection for migrations
DIRECT_URL="postgresql://username:password@host:port/database"

# Pooled connection for app
DATABASE_URL="postgresql://username:password@pooler-host:port/database?pgbouncer=true"
```

Update `schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Cloud PostgreSQL Options
- **Railway**: https://railway.app/
- **Supabase**: https://supabase.com/
- **Neon**: https://neon.tech/
- **AWS RDS**: https://aws.amazon.com/rds/postgresql/
- **Google Cloud SQL**: https://cloud.google.com/sql/docs/postgres

## Rollback Plan

If migration fails, revert to SQLite:
1. Restore `.env`: `DATABASE_URL="file:./dev.db"`
2. Restore `schema.prisma`: Change provider back to `"sqlite"`
3. Regenerate Prisma client: `npx prisma generate`
4. Restore database from backup: `copy prisma\dev.db.backup prisma\dev.db`
