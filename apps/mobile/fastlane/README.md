# Fastlane Pipeline — verificat.xyz Mobile

## Prerequisites

```bash
# Ruby (via Bundler)
gem install bundler

# Infisical CLI
brew install infisical/get-cli/infisical     # macOS
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash && sudo apt-get install -y infisical  # Linux

# Flutter (see .fvmrc or pubspec.yaml for version)
# Match git repo access (for iOS code signing)
```

## Setup

```bash
cd apps/mobile

# Install Ruby dependencies
bundle install

# Install Fastlane plugins (if any)
bundle exec fastlane install_plugins

# (iOS only) Pull signing certificates locally
bundle exec fastlane match_setup
```

## Environment Variables

Set these **before** running any lane (or add to `.env.local`):

| Variable | Required | Description |
|---|---|---|
| `INFISICAL_TOKEN` | Yes | Infisical service token |
| `INFISICAL_ENV` | No | Default: `staging` |
| `MATCH_GIT_URL` | iOS only | Git repo URL for certificates |
| `MATCH_PASSWORD` | iOS only | Match encryption password |
| `APPLE_ID` | iOS only | Apple Developer email |
| `APPLE_TEAM_ID` | iOS only | Apple Team ID |
| `APPLE_ITC_TEAM_ID` | iOS only | App Store Connect Team ID |

## Running

```bash
cd apps/mobile

# Validate that all dart-define keys exist in Infisical (no build)
bundle exec fastlane validate

# Build & deploy iOS to TestFlight
bundle exec fastlane beta_ios

# Build & deploy Android to Play Store internal track
bundle exec fastlane beta_android

# Both platforms
bundle exec fastlane beta

# Promote to production
bundle exec fastlane release
```

## CI

The `mobile-beta.yml` workflow in `.github/workflows/` runs automatically on pushes to `main` touching `apps/mobile/`.

## Dart-define Keys

See [DART_DEFINES.md](./DART_DEFINES.md) for the full manifest of environment variables injected at build time.
