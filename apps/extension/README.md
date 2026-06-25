# Verificat Browser Extension

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

```bash
pnpm install
```

## Environment Variables

The extension needs one variable to know which API to talk to:

| Variable        | Default                 | Description                            |
| --------------- | ----------------------- | -------------------------------------- |
| `API_URL`       | `http://localhost:3000` | Base URL of the API                    |
| `VITE_WEB_HOST` | `https://verificat.xyz` | Base URL of the web app (privacy link) |

### Option A — `.env` file (simplest)

Copy `apps/extension/.env.example` to `apps/extension/.env` and edit:

```bash
API_URL=http://localhost:3000
VITE_WEB_HOST=https://verificat.xyz
```

For staging:

```bash
API_URL=https://api-staging.verificat.xyz
VITE_WEB_HOST=https://staging.verificat.xyz
```

### Option B — Infisical (staging secrets)

If you have an Infisical token for the staging environment, export it and run with the API URL from Infisical:

```bash
# Get the API URL from Infisical and pass it directly
export INFISICAL_TOKEN="st.xxxx"
API_URL=$(npx -y @infisical/sdk@5 init --token "$INFISICAL_TOKEN" --plain --silent \
  --env staging --path /api \
  --secret API_URL 2>/dev/null || echo "http://localhost:3000")
echo "API_URL=$API_URL"
```

Then start the dev server with that value:

```bash
API_URL=$API_URL pnpm dev
```

### Option C — inline on every command

```bash
API_URL=https://api-staging.verificat.xyz pnpm dev
```

## Running

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | Start dev server with hot reload      |
| `pnpm dev:firefox`   | Same, but for Firefox                 |
| `pnpm build`         | Production build (Chromium)           |
| `pnpm build:firefox` | Production build (Firefox)            |
| `pnpm zip`           | Package a `.zip` for Chrome Web Store |
| `pnpm zip:firefox`   | Package for Firefox Add-ons           |
| `pnpm test`          | Run unit tests                        |
| `pnpm lint`          | Lint the source                       |

In dev mode, WXT opens Chromium with the extension loaded. Click the extension icon in the toolbar to open the side panel.
