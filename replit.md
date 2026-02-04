# SpoutBreeze Frontend

## Overview
SpoutBreeze is a professional platform for hosting, attending, and managing webinars. This is the Next.js 15 frontend application using Turbopack.

## Project Architecture
- **Framework**: Next.js 15 with App Router
- **UI Libraries**: MUI (Material UI), Joy UI, Tailwind CSS
- **Authentication**: NextAuth.js with Keycloak integration
- **Payments**: Stripe integration
- **Build Tool**: Turbopack

## Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utility libraries
- `actions/` - Server actions
- `contexts/` - React context providers
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `public/` - Static assets
- `config/` - Configuration files

## Running the Project
The development server runs on port 5000:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

## Environment Variables
Required environment variables (see `.env.local.example`):
- `NEXT_PUBLIC_KEYCLOAK_SERVER_URL` - Keycloak server URL
- `NEXT_PUBLIC_KEYCLOAK_REALM` - Keycloak realm
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` - Keycloak client ID
- `NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI` - OAuth redirect URI
- `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Recent Changes
- 2026-02-04: Initial Replit setup, configured dev server on port 5000
