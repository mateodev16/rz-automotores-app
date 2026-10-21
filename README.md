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

En producción la base es un Postgres alojado (Neon o Supabase). Usá siempre
la **connection string pooled** (host `-pooler`), que es la que evita agotar
las conexiones en un entorno serverless:

```bash
DATABASE_URL=postgresql://usuario:clave@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
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

5. Cargar el catálogo de demostración (opcional)

```bash
npm run seed --workspace=apps/api
```

Inserta en la base los mismos vehículos que el sitio usa como fallback
(`apps/web/src/lib/demo-cars.ts`), para que una instalación nueva no quede
vacía. Se pueden borrar o editar desde el panel de administración. Es
idempotente: si ya hay autos no hace nada salvo que pases `-- --force`.

6. Ejecutar en desarrollo

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
- Si la API no está disponible, el sitio sigue online con el catálogo de
  demostración incluido en `apps/web/src/lib/demo-cars.ts`.

### Todo serverless (Vercel + Neon + Vercel Blob)

La API también puede correr 100% serverless, sin ningún servidor siempre
encendido. Son **dos proyectos de Vercel** (el sitio y la API) y una base
Postgres alojada:

| Pieza              | Servicio        | Notas                                                        |
| ------------------ | --------------- | ------------------------------------------------------------ |
| Sitio (Astro SSR)  | Vercel          | Proyecto 1, Root Directory = raíz del repo                     |
| API (Express)      | Vercel          | Proyecto 2, Root Directory = `apps/api`                       |
| Base de datos      | Neon / Supabase | Postgres gestionado, plan gratuito                           |
| Imágenes           | Vercel Blob     | `BLOB_READ_WRITE_TOKEN`, 500 MB gratis                        |

**1. Base de datos (Neon)**

Creá una base en [neon.tech](https://neon.tech) y copiá la **connection
string.pooled** (el host `-pooler`), que es la que se usa en serverless para
no agotar conexiones. El SQL no cambia: `apps/api/src/config/migrate.js` usa
Postgres puro.

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**2. Proyecto de la API en Vercel**

- Root Directory: `apps/api`
- Framework: Other (lo define `apps/api/vercel.json`, que compila
  `src/index.js` con `@vercel/node` y exporta la app de Express como handler)
- Variables de entorno:

  | Variable               | Valor                                            |
  | ---------------------- | ------------------------------------------------ |
  | `DATABASE_URL`         | connection string pooled de Neon                 |
  | `JWT_SECRET`           | string largo y aleatorio                          |
  | `BLOB_READ_WRITE_TOKEN` | token que genera Vercel al conectar Blob         |
  | `CORS_ORIGIN`          | URL del sitio (opcional; vacío = todos)          |
  | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | credenciales del admin (opcional)       |

**3. Imágenes**

Con `BLOB_READ_WRITE_TOKEN` presente, las subidas del panel de administración
van a Vercel Blob y se guarda la URL pública. Sin ese token, la API escribe en
`uploads/` en disco, que es el modo de desarrollo local (en Vercel el
filesystem es de sólo lectura, por eso el token es obligatorio en producción).

**4. Proyecto del sitio en Vercel**

- Root Directory: raíz del repo (o `apps/web`, para eso está
  `apps/web/vercel.json`)
- Variables: `PUBLIC_API_URL=https://<tu-api>.vercel.app` y
  `PUBLIC_WHATSAPP_NUMBER`

**5. Migraciones y datos**

Corrélas una vez desde tu máquina, apuntando a la base de Neon:

```bash
DATABASE_URL="postgresql://..." npm run migrate --workspace=apps/api
DATABASE_URL="postgresql://..." npm run seed --workspace=apps/api
```

La primera crea el esquema y el usuario admin; la segunda carga el catálogo
de demostración (los mismos autos que usa el sitio como fallback) para que
la web no quede vacía al publicarse. Se borran o editan desde `/admin`.

Notas del modo serverless:

- El pool de Postgres usa **1 conexión por instancia** y se cierra sola.
- Los límites de subida son 4 imágenes × 3 MB por request (Vercel limita el
  body a 4.5 MB); ajustables con `MAX_IMAGES` y `MAX_FILE_SIZE`.
- La API se exporta como handler y **no** escucha en ningún puerto cuando
  `VERCEL=1`; en local sigue funcionando igual que siempre (`npm run dev`).

## Contacto

WhatsApp: 095 530 258
