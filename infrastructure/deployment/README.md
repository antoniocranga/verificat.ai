# Staging Environment

## Overview

Staging is deployed to `staging.verificat.xyz` via a CI pipeline triggered on merge to `main`.

## Services

| Service | URL |
|---------|-----|
| Web App | https://staging.verificat.xyz |
| API | https://staging.verificat.xyz/api |
| Infisical (secrets) | https://infisical-staging.verificat.xyz |

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | Staging VPS IP/hostname |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | SSH private key |
| `VPS_STAGING_DIR` | Deploy directory on VPS |
| `GHCR_TOKEN` | GitHub Container Registry token with `packages:write` |
| `STAGING_SUPABASE_PROJECT_REF` | Staging Supabase project reference |
| `STAGING_SUPABASE_DB_PASSWORD` | Staging Supabase DB password |
| `SUPABASE_URL` | Staging Supabase project URL |
| `SUPABASE_ANON_KEY` | Staging Supabase anon key |

## Deploy Pipeline

1. Push to `main` triggers `docker-build-push.yml`
2. Docker images are built and pushed to GHCR
3. Deploy job SSHes into the VPS
4. Pulls latest images and restarts containers
5. Runs Supabase migrations against staging project

## Infisical

Self-hosted Infisical runs on the same VPS at `infisical-staging.verificat.xyz`.
Secret injection into containers requires `infisical run` wrapper in the deploy script.
