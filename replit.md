# BlueScale Frontend

## Overview
BlueScale is a modern platform that makes hosting, attending, and managing webinars seamless. This is the Next.js 15 frontend application using Turbopack.

## Branding & Design
- **Brand Colors**: Sky blue (#0ea5e9), Teal (#06b6d4), Navy (#1e3a5f)
- **Font**: Inter (modern, clean, professional)
- **Design Language**: Modern, glassmorphism effects, gradient accents, rounded corners
- **Logo**: Custom BlueScale logo at `/public/bluescale_logo.png`

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
- 2026-02-04: Updated all internal pages (Dashboard, Settings, Channels, Events, Join) with BlueScale design
- 2026-02-04: Complete redesign with BlueScale branding - new logo, modern UI with trust/comfort colors
- 2026-02-04: Initial Replit setup, configured dev server on port 5000
