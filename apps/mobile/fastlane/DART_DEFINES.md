# Dart Define Keys

Discovered from scanning `apps/mobile/` for `String.fromEnvironment`, `bool.fromEnvironment`, and `int.fromEnvironment` calls.

| Key | Source File | Default Value |
|---|---|---|
| `SUPABASE_URL` | `lib/core/env/env.dart` | `''` |
| `SUPABASE_ANON_KEY` | `lib/core/env/env.dart` | `''` |
| `API_URL` | `lib/core/env/env.dart`, `lib/features/handoff/presentation/screens/handoff_screen.dart` | `http://localhost:3000` |

## Usage

These values are fetched from Infisical at build time and injected via `--dart-define-from-file`. The `fetch_dart_defines` helper validates that every key in this manifest is present in the Infisical response before writing the temp file.

## Adding a new dart-define

1. Add the `String.fromEnvironment('KEY', defaultValue: '...')` call to the Dart codebase.
2. Add the key to this manifest.
3. Add the key-value pair to the appropriate Infisical environment.
