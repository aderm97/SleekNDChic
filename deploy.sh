#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Build frontend assets
echo "=== Building Frontend ==="
if [ -d "apps/web" ]; then
    echo "Installing frontend dependencies..."
    cd apps/web
    npm ci
    echo "Building frontend production bundle..."
    npm run build
    cd ../..
else
    echo "Warning: apps/web directory not found."
fi

echo "=== Building and starting services ==="
docker compose up --build -d

echo ""
echo "=== Deployment Status ==="
docker compose ps

echo ""
echo "=== Service Logs (last 20 lines) ==="
docker compose logs --tail=20

echo ""
echo "Deployment complete. Use 'docker compose logs -f' to follow logs."
