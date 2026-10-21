# RZ Automotores

Sitio web para RZ Automotores - Concesionaria de autos en Montevideo y Minas, Uruguay.

Diseño rebuild en Astro a partir del prototipo de Figma Make ("Car Dealership
Web Interface"): estética blanco/negro, tipografía Barlow Condensed + Inter,
hero a sangre, catálogo filtrable, ficha de vehículo y panel de administración.

## Tecnologías

- Frontend: Astro 7 (SSR con `@astrojs/node` / `@astrojs/vercel`) + Tailwind CSS v4
- Backend: Node.js + Express
- Base de datos: PostgreSQL

## Arquitectura (Monorepo)

```
rz-automotores-app/
+-- apps/
|   +-- web/        # Astro + Tailwind (frontend SSR)
|   +-- api/        # Express + Node.js (backend API)
+-- packages/
|   +-- db/         # PostgreSQL schema/migrations
|   +-- shared/     # Shared types
+-- uploads/        # Imágenes subidas
```

## Instalación

### Requisitos

- Node.js 22+
- PostgreSQL

### Configuración

1. Instalar dependencias

```bash
npm install
```

2. Configurar la base de datos

```bash
cd apps/api
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

3. Configurar el frontend (opcional, los valores por defecto apuntan a `localhost:4000`)

```bash
cd apps/web
cp .env.example .env
```

| Variable              | Dónde                | Default                 | Descripción                                  |
| --------------------- | -------------------- | ----------------------- | -------------------------------------------- |
| `DATABASE_URL`        | `apps/api/.env`      | -                       | Conexión a PostgreSQL                        |
| `JWT_SECRET`          | `apps/api/.env`      | `secret`                | Firma de los tokens de sesión                |
| `UPLOAD_DIR`          | `apps/api/.env`      | `uploads`               | Carpeta de imágenes (relativa a la raíz)      |
| `API_URL`             | `apps/web/.env`      | `http://localhost:4000` | API que consulta el servidor en cada request  |
| `PUBLIC_API_URL`      | `apps/web/.env`      | `http://localhost:4000` | API que usa el navegador (admin, login)      |
| `PUBLIC_WHATSAPP_NUMBER` | `apps/web/.env`    | `59895530258`           | Número de WhatsApp para los CTA              |

4. Ejecutar las migraciones

```bash
npm run migrate --workspace=apps/api
```

Credenciales por defecto: `admin@rzautomotores.com` / `admin123`
(override con `ADMIN_EMAIL` y `ADMIN_PASSWORD`).

5. Ejecutar en desarrollo

```bash
npm run dev
```

- Frontend: http://localhost:4321
- API: http://localhost:4000

> Si la API o la base de datos no están disponibles, el sitio sigue funcionando:
> se muestra el catálogo de demostración incluido en `apps/web/src/lib/demo-cars.ts`.

## Rutas

| Ruta                  | Descripción                                        |
| --------------------- | -------------------------------------------------- |
| `/`                   | Home: hero, stock filtrable, nosotros, sucursales   |
| `/vehiculos`          | Catálogo completo con filtros                       |
| `/vehiculo/[id]`      | Ficha del vehículo                                  |
| `/admin/login`        | Ingreso al panel                                   |
| `/admin`              | Gestión de stock (alta, edición, borrado, imágenes) |
| `/admin/autos/nuevo`  | Alta de vehículo                                    |
| `/admin/autos/editar/[id]` | Edición de vehículo                           |

## Panel de Administración

- URL: http://localhost:4321/admin/login
- Agregar, editar y eliminar vehículos
- Subir múltiples imágenes
- Marcar vehículos como destacados
- Publicar o dejar en borrador

## Tests

```bash
npm test --workspace=apps/api
```

Verifica que cada consulta SQL declare tantos parámetros enlazados (`$1`,
`$2`, ...) como placeholders usa, y cubre login, alta, edición y borrado
contra una base de datos simulada.

## Producción

```bash
npm run build --workspace=apps/web
npm run start --workspace=apps/api
```

El build de Astro genera un servidor Node standalone en `apps/web/dist/`
(`node apps/web/dist/server/entry.mjs`).

## Deploy en Vercel

El frontend se despliega en Vercel como serverless functions. `vercel.json`
ya define el build del monorepo:

```json
{
  "framework": "astro",
  "installCommand": "npm install",
  "buildCommand": "npm run build --workspace=apps/web",
  "outputDirectory": "apps/web/.vercel/output"
}
```

- `apps/web/astro.config.mjs` elige el adapter según el entorno: `@astrojs/vercel`
  cuando existe la variable `VERCEL` (builds de Vercel) y `@astrojs/node`
  (standalone) en cualquier otro caso, para que el build local siga sirviendo
  con `node dist/server/entry.mjs`.
- Configurá las variables de entorno del proyecto en Vercel:
  `PUBLIC_API_URL` (URL pública de la API) y `PUBLIC_WHATSAPP_NUMBER`.
- El lockfile de referencia es el de la raíz del repo (`package-lock.json`).
  Los lockfiles por workspace están ignorados a propósito: rompen `npm ci`.
- La API (Express + PostgreSQL) no corre en Vercel; hosteala aparte (VPS,
  Railway, Render…) y apuntá `PUBLIC_API_URL` a esa URL. Si la API no está
  disponible, el sitio sigue online con el catálogo de demostración.

## Contacto

WhatsApp: 095 530 258
