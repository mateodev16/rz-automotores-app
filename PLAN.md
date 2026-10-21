# Plan: RZ Automotores Web Interface

## Goal
Build a web interface for RZ Automotores (car dealership in Montevideo and Minas, Uruguay) with:
- Public catalogue (e-commerce style)
- Admin panel to add/edit cars
- Stack: Astro + Tailwind CSS + Node.js + Express + PostgreSQL

## Design
Rebuilt from the Figma Make prototype ("Car Dealership Web Interface"):
- Monochrome palette (near-black `#080808` on white), Barlow Condensed (display, italic/black)
  + Inter (body)
- Hero full-bleed with the featured vehicle, marquee ticker, split sections
- Catalogue cards with hover overlay, filters (marca, ubicación, precio, año)
- Vehicle modal + standalone detail page, WhatsApp CTAs throughout
- Admin: fixed black sidebar, inventory table, slide-in vehicle form

## Assets
- Logo: apps/web/src/assets/images/logo-rz.png, apps/web/public/logo-rz.png
- Favicon: apps/web/public/favicon.svg

## Architecture (Monorepo)
```
rz-automotores-app/
+-- apps/
|   +-- web/        # Astro + Tailwind (frontend, SSR via @astrojs/node)
|   +-- api/        # Express + Node.js (backend API)
+-- packages/
|   +-- db/         # PostgreSQL schema/migrations
|   +-- shared/     # Shared types
+-- uploads/        # Image uploads
```

## Database Schema
- users (admin auth)
- cars (listings with brand/model/year/km/price/currency/location/fuel/transmission/body/color/description/status/featured)
- car_images (images per car, ordered)
- inquiries (leads from "Consultar" button)

## Implementation Steps
1. [x] Setup monorepo - Configure package.json workspaces
2. [x] Scaffold API (Express) - Auth, CRUD for cars, image upload (multer), PostgreSQL connection
3. [x] Scaffold Web (Astro) - Tailwind setup, SSR adapter, routing, public pages + admin pages
4. [x] Database - Create schema/migrations, seed admin user
5. [x] Public site - Home, catalogue with filters, car detail, "Consultar" CTA (WhatsApp)
6. [x] Admin panel - Login, dashboard, car form with multiple images, manage listings
7. [x] Styling - Extract colors/fonts from the design, apply to the Tailwind theme
8. [x] Testing & docs - API test suite, .env.example, README with setup instructions

## Notes
- The web app renders on the server and falls back to `src/lib/demo-cars.ts` when the
  API or the database is unreachable, so the site is always browsable.
- `apps/api/__test__/api.test.mjs` guards against the class of bug where SQL bind
  placeholders (`$1`, `$2`) are lost and the queries silently stop filtering.
