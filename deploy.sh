#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "=== SleekNDChic Deployment ==="
echo "Building and starting services..."

docker compose up --build -d

echo ""
echo "=== Deployment Status ==="
docker compose ps

echo ""
echo "=== Service Logs (last 20 lines) ==="
docker compose logs --tail=20

echo ""
echo "Deployment complete. Use 'docker compose logs -f' to follow logs."
