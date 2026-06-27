# Staging Environment

## Overview

Staging is deployed to `staging.verificat.xyz` via a CI pipeline triggered on merge to `main`.

## Services

| Service | URL |
|---------|-----|
| Web App | https://staging.verificat.xyz |
| API (staging) | https://api-staging.verificat.xyz |
| API (production) | https://api.verificat.xyz |

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | Staging VPS IP/hostname |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | SSH private key |
| `VPS_DIR` | Deploy directory on VPS |
| `GHCR_TOKEN` | GitHub Container Registry token with `packages:write` |
| `SUPABASE_PROJECT_REF` | Supabase project reference |
| `SUPABASE_DB_PASSWORD` | Supabase DB password |
| `SUPABASE_URL` | Staging Supabase project URL |
| `SUPABASE_ANON_KEY` | Staging Supabase anon key |

## Deploy Pipeline

1. Push to `main` triggers `docker-build-push.yml`
2. Docker images are built and pushed to GHCR
3. Deploy job SSHes into the VPS
4. Pulls latest images and restarts containers
5. Runs Supabase migrations against staging project

## Secrets

Secrets are managed via Infisical Cloud (eu.infisical.com). The API loads them at startup using the `INFISICAL_TOKEN` service token. If the token is not available, it falls back to local environment variables.
