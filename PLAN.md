# Plan: RZ Automotores Web Interface

## Goal
Build a web interface for RZ Automotores (car dealership in Montevideo and Minas, Uruguay) with:
- Public catalogue (e-commerce style) 
- Admin panel to add/edit cars
- Stack: Astro + Tailwind CSS + Node.js + Express + PostgreSQL

## Assets
- Logo: apps/web/src/assets/images/logo.png, lecal-logo.jpeg
- Typography reference: apps/web/src/assets/images/typography.png

## Architecture (Monorepo)
`
rz-automotores-app/
+-- apps/
¦   +-- web/        # Astro + Tailwind (frontend)
¦   +-- api/        # Express + Node.js (backend API)
+-- packages/
¦   +-- db/         # PostgreSQL schema/migrations
¦   +-- shared/     # Shared types
+-- uploads/        # Image uploads
`

## Database Schema
- users (admin auth)
- cars (listings with brand/model/year/km/price/currency/location/fuel/transmission/body/color/description/status/featured)
- car_images (images per car, ordered)
- inquiries (leads from "Consultar" button)

## Implementation Steps
1. Setup monorepo - Configure package.json workspaces
2. Scaffold API (Express) - Auth, CRUD for cars, image upload (multer), PostgreSQL connection
3. Scaffold Web (Astro) - Tailwind setup, routing, public pages + admin pages
4. Database - Create schema/migrations, seed admin user
5. Public site - Home, catalogue with filters (location, price, brand, year, km), car detail with gallery, "Consultar" CTA (WhatsApp)
6. Admin panel - Login, dashboard, car form with multiple images, manage listings
7. Styling - Extract colors/fonts from assets, apply to Tailwind config
8. Testing & docs - .env.example, README with setup instructions
