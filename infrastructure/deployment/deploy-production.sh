#!/bin/bash
set -euo pipefail

PROD_DIR="${VPS_DIR:-/opt/verificat/production}"

# Login to GHCR
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

# Pull latest images
docker pull ghcr.io/antoniocranga/verificat.ai/web:latest
docker pull ghcr.io/antoniocranga/verificat.ai/api:latest

# Restart production stack
cd "$PROD_DIR"
docker rm -f verificat-web verificat-api verificat-whisper || true
docker compose -f docker-compose.production.yml up -d --remove-orphans
docker image prune -f

# Run Supabase migrations on production project
if command -v supabase &> /dev/null; then
  echo "Running Supabase migrations on production project..."
  cd /home/deploy/verificat.xyz
  supabase link --project-ref "$SUPABASE_PROJECT_REF" \
    --password "$SUPABASE_DB_PASSWORD"
  supabase db push --include-all
else
  echo "Supabase CLI not found — skipping migrations."
  echo "Install with: brew install supabase/tap/supabase"
fi
