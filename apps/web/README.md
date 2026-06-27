# verificat.xyz Web Application

This is the Next.js web application for the verificat.xyz landing page, authentication portals, and admin dashboard. It uses Turbopack, App Router, and is integrated into the monorepo.

## Getting Started Locally

### 1. Install Dependencies

Since this project uses Turborepo and `pnpm`, you should run the install command from the root of the repository:

```bash
cd ../../
pnpm install
```

### 2. Environment Variables

To run the web app locally, you need to configure your environment variables.
Copy the `.env.example` file to a new file named `.env.local` inside the `apps/web` directory:

```bash
cd apps/web
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. At a minimum, you'll need the Supabase configuration to authenticate and interact with the database.

**Required `.env.local` Variables:**

```env
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Store Links (if left blank, buttons will show "În curând")
NEXT_PUBLIC_STORE_CHROME=
NEXT_PUBLIC_STORE_FIREFOX=
NEXT_PUBLIC_STORE_EDGE=
NEXT_PUBLIC_STORE_IOS=
NEXT_PUBLIC_STORE_ANDROID=

# Site and API URLs (Defaults for local development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Note**: If you are using Infisical to manage your secrets locally, you can alternatively run the app using `infisical run -- pnpm dev`.

### 3. Run the Development Server

You can run the Next.js development server (using Turbopack) with:

```bash
pnpm dev
```

_(Or from the monorepo root: `pnpm turbo run dev --filter=web`)_

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will hot-reload as you make edits to `src/app/page.tsx` or other components.

### 4. Build for Production

To create a production build and test it locally:

```bash
# Build the project
pnpm build

# Start the production server
pnpm start
```
