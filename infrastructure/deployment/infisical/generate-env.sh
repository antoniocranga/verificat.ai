#!/bin/bash
cd /home/deploy/verificat.ai/infrastructure/deployment/infisical
DB_PASS=$(openssl rand -hex 16)
ENC_KEY=$(openssl rand -hex 16)
AUTH_SEC=$(openssl rand -base64 32)
cat <<EOF > .env
ENCRYPTION_KEY=$ENC_KEY
AUTH_SECRET=$AUTH_SEC
DB_PASSWORD=$DB_PASS
SITE_URL=https://eu.infisical.com
EOF
chmod 600 .env
