#!/bin/bash
set -euo pipefail

STAGING_DIR="${VPS_DIR:-/home/deploy/verificat-staging}"

# Login to GHCR
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin

# Pull latest images
docker pull ghcr.io/antoniocranga/verificat.ai/web:latest
docker pull ghcr.io/antoniocranga/verificat.ai/api:latest

# Restart staging stack
cd "$STAGING_DIR"
docker rm -f verificat-web verificat-api || true
docker compose -f docker-compose.staging.yml up -d --remove-orphans
docker image prune -f

# Run Supabase migrations on staging project
if command -v supabase &> /dev/null; then
  echo "Running Supabase migrations on staging project..."
  cd /home/deploy/verificat.ai
  supabase link --project-ref "$SUPABASE_PROJECT_REF" \
    --password "$SUPABASE_DB_PASSWORD"
  supabase db push --include-all
else
  echo "Supabase CLI not found — skipping migrations."
  echo "Install with: brew install supabase/tap/supabase"
fi
